const express = require('express');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();
const request = require('request');
const jwtDecode = require('jwt-decode');

let apiData;

/* GET user profile. */
router.get('/', ensureLoggedIn, function(req, res, next) {
  
  let decodedIDToken = jwtDecode(req.user.extraParams.id_token);
  let decodedAccessToken = jwtDecode(req.user.extraParams.access_token);

  if (apiData) {
    apiData = 'API Result: ' + apiData;
  }

  res.render('user', {
    user: req.user,
    decodedIDToken,
    decodedAccessToken,
    apiData: apiData,
    title: 'NodeJS Cross-origin Auth Demo'
  });

  apiData = '';
});

router.get('/apicall', ensureLoggedIn, function(req, res, next) {
  // invoke diag endpoint with authn header
  console.log('calling API');
  var options = {
    url: `${process.env.API_ENDPOINT}`,
    headers: {
      'Authorization': 'Bearer ' + req.user.extraParams.access_token
    }
  };

  request(options, function(error, response, body) {
    if (error) {
      apiData = 'Unable to call API: ' + error.message;
      return res.redirect('/user');
    }
    if (response.statusCode === 401) {
      // need a refresh token
      apiData = 'Unauthorized. You may need to refresh.';
      return res.redirect('/user');
    }
    
    try {
      apiData = JSON.parse(body).data;
    } catch (err) {
      apiData = 'Unable to parse API response';
    }
    return res.redirect('/user');
  });
});

router.get('/refresh', ensureLoggedIn, function(req, res, next) {
  // get refresh token
  getRefreshToken(req, function (error, response, body) {
    req.user.extraParams.id_token = body.id_token;
    req.user.extraParams.access_token = body.access_token;
    return res.redirect('/user/apicall');
  });
});

function getRefreshToken(req, cb) {
  // get refresh token
  var options = { method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: { 
      grant_type: 'refresh_token',
      client_id: `${process.env.AUTH0_CLIENT_ID}`,
      client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
      refresh_token: req.user.extraParams.refresh_token,
      redirect_uri: `${process.env.AUTH0_CALLBACK_URL}` 
    }, 
    json: true 
  };

  return request(options, cb);
}

module.exports = router;
