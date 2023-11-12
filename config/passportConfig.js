const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin'); // Import the Admin model

function initialize(passport, getAdminByUsername) {

  passport.use('local', new localStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const role = req.body.role;

    try {
        // Find the admin by username
        const admin = await Admin.findOne({ username: username });

        if (!admin) {
            return done(null, false, { message: 'Username not found' });
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return done(null, false, { message: 'Password incorrect' });
        }

        // Check if the role matches
        if (admin.role !== role) {
            return done(null, false, { message: 'Role incorrect' });
        }

        return done(null, admin);
    } catch (error) {
        return done(error);
    }
}));


  passport.serializeUser((admin, done) => {
    done(null, admin.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const admin = await Admin.findById(id);
      done(null, admin);
    } catch (error) {
      done(error);
    }
  });
}

module.exports = initialize;
