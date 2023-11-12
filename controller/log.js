
  const express = require(`express`)
const router = express.Router();
const mongoose = require(`mongoose`);
const session = require('express-session');
const flash = require('express-flash');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const ejs = require(`ejs`);
const Admin = require('../models/admin');



// Passport config
const initializePassport = require('../config/passportConfig');

initializePassport(passport, async (username) => {
  try {
    const admin = await Admin.find({ username: username });
    return admin;
  } catch (error) {
    // Handle any errors here
    console.error(error);
    return null;
  }
});


const app = express();



router.get('/logPage', checkNotAuthenticated, (req, res) => {
    res.render('logPage');
  });

  router.post('/logPage', checkNotAuthenticated, passport.authenticate('local',{

    successRedirect:'/dashboard',
    failureRedirect: '/logPage',
    failureFlash: true
  
  }));




router.get('/dashboard', checkAuthenticated, async (req, res) => {
    // Set cache control headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
       
        const admin = await Admin.findById(req.user);

        if (admin) {
            const name = admin.fullName; 
            res.render('dashboard', { name });
        } else {
            res.render('dashboard', { name: 'Guest' }); // Handle the case where the admin is not found
        }
    } catch (error) {
        console.error(error);
        res.render('dashboard', { name: 'Guest' }); // Handle errors gracefully
    }
});



//CHECKING IF ADMIN IS AUTHENTICATED WONT ALLOW YOU TO VISIT DASHBOARD IF YOU'RE NOT LOGIN
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/logPage');
}

//if admin is authenticated you cant go out till you sign out
function checkNotAuthenticated(req, res,next){
    if(req.isAuthenticated()){
       return res.redirect('/dashboard')
    }
    //keeps inside dashboard
   next()
}
module.exports = router;


