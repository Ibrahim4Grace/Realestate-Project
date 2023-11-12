const express = require(`express`)
const router = express.Router();
const mongoose = require(`mongoose`);
const session = require('express-session');
const flash = require('connect-flash');
 const nodemailer = require(`nodemailer`);
// const bcrypt = require('bcryptjs');
// const passport = require('passport');

const ejs = require(`ejs`);


const app = express();

const Properties  = require('../models/property');
const { ContactUsEnquire, ContactUs } = require('../models/contact');
const OurAgent  = require('../models/agent');
// Send email to the applicant
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});


router.get(`/`, checkNotAuthenticated, (req, res) => {

    Properties.find({})
            .then((results) => {
                res.render('index', {properties: results});
            })
            .catch((err) => {
                console.log(err);
                res.redirect('/')
            })
    
});

router.get(`/about`,checkNotAuthenticated, (req, res) => {

    res.render(`about`);
});

router.get(`/agent`,checkNotAuthenticated, async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page

    try {
        const totalPosts = await Properties.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        const ourAgent = await OurAgent.find({})
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('agent', { ourAgent, totalPages, currentPage: page });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


router.get(`/buysalerent`, checkNotAuthenticated, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page

    try {
        const totalPosts = await Properties.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        const properties = await Properties.find({})
            .skip((page - 1) * perPage)
            .limit(perPage);

        res.render('buysalerent', { properties, totalPages, currentPage: page });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


router.get('/property-detail/:_id', checkNotAuthenticated, (req, res) => {
    const prop = Properties.findOne({ _id: req.params._id })
        .then((results) => {
            if (results) {
                res.render('property-detail', { properties: results });
            } else {
                res.status(404).send('Property not found'); // Handle case when property is not found
            }
        })
        .catch((err) => {
            res.status(500).send('Internal Server Error'); // Handle other errors
            console.log(err);
        });
});


router.post(`/searchProperty`,checkNotAuthenticated, async (req, res) => {
    try {
        const { propertyStatus, amount, propertyType, countryCity } = req.body;

        // Convert the amount to a number (assuming it's in a format like "$300,000")
        const numericAmount = parseFloat(amount.replace(/[^\d.]/g, '')); // Remove non-numeric characters

        const query = {
            propertyStatus: { $regex: new RegExp(propertyStatus, 'i') },
            amount: { $lte: numericAmount },
            propertyType: { $regex: new RegExp(propertyType, 'i') },
            countryCity: { $regex: new RegExp(countryCity, 'i') }
        };

        const properties = await Properties.find(query);

        res.render('searchProperty', { properties,countryCity,propertyType  });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});


router.post(`/contactUsEnquire/:m_id/:heading/:propertyType/:address/:countryCity`, checkNotAuthenticated, async (req, res) => {

    const property_id = req.params.m_id;

    // And in your server route, we can decode it using decodeURIComponent()
    const heading = decodeURIComponent(req.params.heading);
    const propertyType = decodeURIComponent(req.params.propertyType);
    const address = decodeURIComponent(req.params.address);
    const countryCity = decodeURIComponent(req.params.countryCity);

    const { flname, email, contactNumber, message} = req.body;


    //check required fields
    if (!flname || !email || !contactNumber || !message ) {
        req.flash(`error`, `Please fill all fields`);
        res.redirect(`/property-detail`);
    } else {

        const newContactUsEnquire = new ContactUsEnquire({

            flname,
            email,            
            contactNumber,
            message,
            property_id: property_id,
            heading:heading,
            propertyType:propertyType,
            address:address,
            countryCity:countryCity,
            
            
        });

        //TO SAVE INTO DATABASE INPUT
        try {
            newContactUsEnquire.save();
            let msg =
            'Dear ' + flname + ",\n\n" +
            "Thank you for reaching out to Korex RealEstate regarding your interest in the "  + heading + ". We appreciate the opportunity to assist you in finding your dream home..\n\n" +

            "Your inquiry details:\n" +
            "Property Type: " + propertyType + "\n" +
            "Property Address: " + address + "\n" +
            "City: " + countryCity + "\n\n" +

            "Your Contact Information:\n" +
            "Name: " + flname + "\n" +
            "Email: " + email + "\n" +
            "Phone Number: " + contactNumber + "\n\n" +

            "Our team has received your inquiry, and we will be reviewing it shortly. One of our experienced agents will get in touch with you as soon as possible to discuss your requirements and provide you with more information about this property.\n\n" +

            "If you have any urgent matters or questions in the meantime, please feel free to contact us directly  at 2347033731378.\n\n" +

            "We understand that purchasing a new home is a significant decision, and we are committed to making your experience as smooth and informative as possible..\n\n" +

            "Thank you for considering Korex RealEstate for your real estate needs. We look forward to assisting you in finding your ideal property...\n\n" +

            "Best regards\n" +
            "Korex RealEstate\n" +
            "Company address 6 ojuelegba street of akinde estate Lagos";


         
            const mailOptions = {
                from: 'ibro4grace@gmail.com',
                to: email,
                subject: 'Thank you for reaching out to us!',
                text: msg,

            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Email sending error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
           
            res.redirect('/buysalerent');
        } catch (err) {
            console.log(err);
            req.flash('error', 'An error occurred while sending your message');
            res.redirect('/');

        }
    }


});


router.get('/contact', checkNotAuthenticated, (req, res) => {
    res.render('contact');
  });

  
router.post(`/contactUs`, checkNotAuthenticated, async (req, res) => {


    const { flname, email, contactNumber, message} = req.body;


    //check required fields
    if (!flname || !email || !contactNumber || !message ) {
        req.flash(`error`, `Please fill all fields`);
        res.redirect(`/contact`);
    } else {

        const newContactUs = new ContactUs({

            flname,
            email,            
            contactNumber,
            message
        });

        //TO SAVE INTO DATABASE INPUT
        try {
            newContactUs.save();
            
            let msg =
            'Dear ' + flname + ",\n\n" +
            "Thank you for reaching out to Korex RealEstate. We appreciate the opportunity to assist you in finding your dream home..\n\n" +

            "Your Contact Information:\n" +
            "Name: " + flname + "\n" +
            "Email: " + email + "\n" +
            "Phone Number: " + contactNumber + "\n" +
            "Message: " + message + "\n\n" +
           

            "Our team has received your inquiry, and we will be reviewing it shortly. One of our experienced agents will get in touch with you as soon as possible to discuss your requirements and provide you with more information about this property.\n\n" +

            "If you have any urgent matters or questions in the meantime, please feel free to contact us directly  at 2347033731378.\n\n" +

            "We understand that purchasing a new home is a significant decision, and we are committed to making your experience as smooth and informative as possible..\n\n" +

            "Thank you for considering Korex RealEstate for your real estate needs. We look forward to assisting you in finding your ideal property...\n\n" +

            "Best regards\n" +
            "Korex RealEstate\n" +
            "Company address 6 ojuelegba street of akinde estate Lagos";


         
            const mailOptions = {
                from: 'ibro4grace@gmail.com',
                to: email,
                subject: 'Thank you for reaching out to us!',
                text: msg,

            };

          
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Email sending error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
            // res.send(`Movie Successfully saved into DB`);
            req.flash('success_msg', 'Message successfully sent.');
            res.redirect('/');
        } catch (err) {
            console.log(err);
            req.flash('error', 'An error occurred while sending your message');
            res.redirect('/');

        }
    }


});


  

//if admin is authenticated you cant go out till you sign out
function checkNotAuthenticated(req, res,next){
    if(req.isAuthenticated()){
       return res.redirect('/dashboard')
    }
    //keeps inside dashboard
   next()
}

module.exports = router;


