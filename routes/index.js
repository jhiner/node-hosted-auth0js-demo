const express = require('express');
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'NodeJS Centralized Login Demo' });
});

router.get('/login', function(req, res){
  res.redirect('/');
});

router.get('/diag', function(req, res) {
  res.send({
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET.substr(0, 3) + '...',
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL,
    AUTH0_SILENT_CALLBACK_URL: process.env.AUTH0_SILENT_CALLBACK_URL,
    LOGOUT_URL: process.env.LOGOUT_URL,
    API_ENDPOINT: process.env.API_ENDPOINT
  });
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/loggedOut', function(req, res){
  res.json({status: 'logged out'});
});

router.post('/callback', function(req, res) {
  res.redirect(req.session.returnTo || '/user');
});

router.get('/silent-callback.html', function(req, res) {
  res.render('silent-callback');
});

router.get('/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/error',
  }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/user');
  });


router.get('/unauthorized', function(req, res) {
  res.render('unauthorized');
});


module.exports = router;
