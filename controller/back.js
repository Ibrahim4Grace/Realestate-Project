
const express = require(`express`)
const router = express.Router();
const mongoose = require(`mongoose`);
const session = require('express-session');
const flash = require('connect-flash');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const nodemailer = require(`nodemailer`);
const bcrypt = require('bcryptjs');
const passport = require('passport');

const ejs = require(`ejs`);


const app = express();

const Properties  = require('../models/property');
const OurAgent  = require('../models/agent');
const { ContactUsEnquire, ContactUs } = require('../models/contact');
const Admin = require('../models/admin');

// Send email to the applicant
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});






router.post(`/addNewProperty`, checkAuthenticated,  upload.array('images', 3),(req, res) => {

    // USING DATA destructuring
    const { contactPerson, description, propertyType, amount, houseCondition, tax, propertyStatus,agentNumber,address,countryState,countryCity,country,sizeinFt,heading,rooms,bedrooms,bathrooms,garages,garageSize,yearBuilt,availableFrom,basement,roofing,exteriorMaterial } = req.body;


    //check required fields
    if (!contactPerson || !description || !propertyType || !amount || !houseCondition || !tax || !propertyStatus || !agentNumber || !address || !countryState || !countryCity || !country || !sizeinFt || !heading || !rooms || !bedrooms || !bathrooms || !garages || !garageSize || !yearBuilt || !availableFrom || !basement || !roofing || !exteriorMaterial ) {
        req.flash(`error`, `Please fill all fields`);
        res.redirect(`/addNewProperty`);
    }  // Check if an image was uploaded
   
     else {

     

        //TO SAVE INTO DATABASE INPUT
        try {
      
            newProperties.save();
           
            // res.send(`Movie Successfully saved into DB`);
            req.flash('success_msg', 'Property added successfully');
            res.redirect('/addNewProperty');
        } catch (err) {
            console.log(err);
            req.flash('error', 'An error occurred while adding the expense');
            res.redirect('/addNewProperty');

        }
    }


});

router.get(`/myProperties`, checkAuthenticated, async (req, res) => {


    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page
    const totalPosts = await Properties.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    const properties = await Properties.find()
        .skip((page - 1) * perPage)
        .limit(perPage);

    res.render('myProperties', { properties, totalPages, currentPage: page });

   
});

router.get(`/editProperty/:m_id`, checkAuthenticated, (req, res) => {

    const prop = Properties.findOne({ _id: req.params.m_id })

        .then((recs) => {

            res.render(`editProperty`, { properties: recs })
        })

        .catch((err) => {

            res.send(`There's a problem selecting from DB`);
            res.redirect('/myProperties');
            console.log(err);
        })

   
});


router.post(`/editProperty/:m_id`, checkAuthenticated, (req, res) => {
    let errors = [];

    const mu_id = req.params.m_id;

    const {contactPerson, description, propertyType, amount, houseCondition, tax, propertyStatus,agentNumber, address, countryState, countryCity, sizeinFt, heading, rooms, bedrooms, bathrooms, garages, garageSize, yearBuilt, availableFrom,basement, roofing, exteriorMaterial  } = req.body;

    Properties.findByIdAndUpdate(mu_id, { $set: {  contactPerson, description, propertyType, amount, houseCondition, tax, propertyStatus,agentNumber, address, countryState, countryCity, sizeinFt, heading, rooms, bedrooms, bathrooms, garages, garageSize, yearBuilt, availableFrom,basement, roofing, exteriorMaterial } })

        .then(() => {
            // res.send(`Successfully Edited`)
            req.flash(`success_msg`, 'Property Successfully Updated');
            res.redirect('/myProperties');

        })
        .catch((err) => {
            console.log(err)
            res.send(`There is issue with your information`)
            res.redirect('/myProperties');

        })



});

router.post(`/searchProperties`, checkAuthenticated, async (req, res) => {
    try {
        const coCity = req.body.countryCity;

        const query = {
            countryCity: { $regex: new RegExp(coCity, 'i') }
        };

        const properties = await Properties.find(query);

        res.render('searchProperties', { properties }); 
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});



router.get(`/deleteProperty/:m_id`, checkAuthenticated, (req, res) => {


    const mid = req.params.m_id;
    Properties.findByIdAndDelete(mid)

        .then(() => {
            req.flash(`success_msg`, 'Property deleted successfully');
            res.redirect(`/myProperties`)
        })
        .catch(() => {

            res.send(`error`)
        })
});










router.get(`/contactUs`, checkAuthenticated, async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page
    const totalPosts = await ContactUs.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    const contactUs = await ContactUs.find()
        .skip((page - 1) * perPage)
        .limit(perPage);

    res.render('contactUs', { contactUs, totalPages, currentPage: page });

});

router.get(`/deleteContactUs/:m_id`, checkAuthenticated, (req, res) => {

    const mid = req.params.m_id;
    ContactUs.findByIdAndDelete(mid)

        .then(() => {
            req.flash(`success_msg`, 'Contact deleted successfully');
            res.redirect(`/contactUs`)
        })
        .catch(() => {

            res.send(`error`)
        })
});

router.get(`/houseEnquireforum`, checkAuthenticated, async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page
    const totalPosts = await ContactUsEnquire.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    const contactEnquire = await ContactUsEnquire.find()
        .skip((page - 1) * perPage)
        .limit(perPage);

    res.render('houseEnquireforum', { contactEnquire, totalPages, currentPage: page });

});

router.get(`/deletecontactEnquire/:m_id`, checkAuthenticated, (req, res) => {

    const mid = req.params.m_id;
    ContactUsEnquire.findByIdAndDelete(mid)

        .then(() => {
            req.flash(`success_msg`, 'Enquire deleted successfully');
            res.redirect(`/houseEnquireforum`)
        })
        .catch(() => {

            res.send(`error`)
        })
});







// HTML DOESNT SUPPOT DELETE WE NPM I METHOD-OVERRIDE
router.delete('/logout', (req, res) => {
    req.logOut(function(err) {
        if (err) {
            console.error(err);
        }
		 res.clearCookie('connect.sid'); // Clear session cookie
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '-1');
        req.session.destroy(); // Clear the session
        res.redirect('/logPage'); // Redirect to the login page
    });
});




module.exports = router;




