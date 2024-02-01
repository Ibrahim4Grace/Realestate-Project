const express = require(`express`)
const router = express.Router();
const nodemailer = require(`nodemailer`);
const Properties  = require('../models/property');
const { ContactUsEnquire, ContactUs } = require('../models/contact');
const OurAgent  = require('../models/agent');



// Send email to the applicant
const transporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});


const landingPage = (req, res) => {
    Properties.find({})
    .then((results) => {
        res.render('index', {properties: results});
    })
    .catch((err) => {
        console.error(err);
        res.redirect('/')
    })  
};

const aboutUsPage = (req, res) => {
    res.render(`about`);  
};

const agentPage = async(req, res) => {
   
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 5; 
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
};

const buySaleRentPage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 5; // Number of items per page    
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
};

const propertyDetailsPage = (req, res) => {
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
        console.error(err);
    });  
};

const searchPropertyPage = async (req, res) => {
    try {
        const { propertyStatus, amount, propertyType, city } = req.body;

        let query = {
            propertyStatus: { $regex: new RegExp(propertyStatus, 'i') },
            propertyType: { $regex: new RegExp(propertyType, 'i') },
            city: { $regex: new RegExp(city, 'i') }
        };

        if (amount && amount !== 'Any') {
            if (amount === 'Below #50,000,000') {
                // Exclude the amount condition, include all properties in that city
            } else {
                const numericAmount = parseFloat(amount.replace(/[^\d.]/g, ''));
                query.amount = { $lte: numericAmount };
            }
        }

        const properties = await Properties.find(query);

        res.render('searchProperty', { properties, city, propertyType, amount, propertyStatus });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};


const contactUsEnquirePost = async (req, res) => {
    console.log('Server route hit'); // Add this log
    const property_id = req.params.m_id;

    console.log('Property ID:', property_id);

    // And in your server route, we can decode it using decodeURIComponent()
    const heading = decodeURIComponent(req.params.heading);
    const propertyType = decodeURIComponent(req.params.propertyType);
    const address = decodeURIComponent(req.params.address);
    const city = decodeURIComponent(req.params.city);

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
            city:city,
            
            
        });

        try {
            newContactUsEnquire.save();
            

            let phoneNumber = process.env.COMPANY_NUMBER;
            let emailAddress = process.env.COMPANY_EMAIL;
            let companyAddress = process.env.COMPANY_ADDRESS;
    
            let msg = `
            <p><img src="cid:estate" alt="Company Logo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
            <p>Dear ${flname}, Thank you for reaching out to Korex RealEstate regarding your interest in the ${heading}. We appreciate the opportunity to assist you in finding your dream home.</p>
        
           
             <p>Your inquiry details:</p>
            <ul>
                 <li>Full Name: ${flname}</li>
                    <li>Email: ${email}</li>
                    <li>Phone Number: ${contactNumber}</li>
                 <li>Property Type: ${propertyType}</li>
                 <li>Home Address: ${address}</li>
                 <li>City: ${city}</li>
            </ul>
            
   
            
            <p>Our team has received your inquiry, and we will be reviewing it shortly. One of our experienced agents will get in touch with you as soon as possible to discuss your requirements and provide you with more information about this property.</p> 
            
            <p>If you have any urgent matters or questions in the meantime, please feel free to contact us directly at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>
           
            <p>We understand that purchasing a new home is a significant decision, and we are committed to making your experience as smooth and informative as possible.</p>
            
            <p>Thank you for considering Korex RealEstate for your real estate needs. We look forward to assisting you in finding your ideal property.</p>
        
        
            <p>Best regards,<br>
            The Korex RealEstate Team<br>
            ${companyAddress}</p>`;

            const mailOptions = {
                from: process.env.NODEMAILER_EMAIL,
                 to: email,
                 subject: 'Thank you for reaching out to us!',
                 html: msg,
                 attachments: [
                    {
                        filename: 'estate.jpg',
                        path: './public/img/estate.jpg',
                        cid: 'estate'
                    }
                ]
             };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Email sending error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
          
            res.status(200).redirect('/buysalerent');
        } catch (err) {
            console.error(err);
            req.flash('error', 'An error occurred while sending your message');
            res.redirect('/');

        }
    }
};

const contactUsPage = (req, res) => {
    res.render('contact');
};

const contactUsPagePost = async (req, res) => {

    const { flname, email, contactNumber, message} = req.body;

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
            
            let phoneNumber = process.env.COMPANY_NUMBER;
            let emailAddress = process.env.COMPANY_EMAIL;
            let companyAddress = process.env.COMPANY_ADDRESS;
			
			
            let msg = `
            <p><img src="cid:estate" alt="Company Logo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
            <p>Dear ${flname}, Thank you for reaching out to Korex RealEstate. We appreciate the opportunity to assist you in finding your dream home..</p>
     
            <p>Your Contact Information:</p>
            <ul>
                <li>Full Name: ${flname}</li>
			     <li>Email: ${email}</li>
				 <li>Phone Number: ${contactNumber}</li>
                 <li>Message: ${message}</li>
            </ul>
         
         <p>Our team has received your inquiry, and we will be reviewing it shortly. One of our experienced agents will get in touch with you as soon as possible to discuss your requirements and provide you with more information about this property..</p> 
         
         <p>If you have any urgent matters or questions in the meantime, please feel free to contact us directly at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>
        
         <p>We understand that purchasing a new home is a significant decision, and we are committed to making your experience as smooth and informative as possible.</p>
		 
		 <p>Thank you for considering Korex RealEstate for your real estate needs. We look forward to assisting you in finding your ideal property.</p>
     
         <p>Best regards,<br>
            The Korex RealEstate Team<br>
            ${companyAddress}
         </p>`;
		 
		   const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
             to: email,
              subject: 'Thank you for reaching out to us!',
             html: msg,
             attachments: [
                {
                        filename: 'estate.jpg',
                        path: './public/img/estate.jpg',
                        cid: 'estate'
                }
            ]
         };
         
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Email sending error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
         
            res.status(200).redirect('/contact');
        } catch (err) {
            console.log(err);
            req.flash('error', 'An error occurred while sending your message');
            res.redirect('/');

        }
    }
};
  
  


module.exports = ({
    landingPage,aboutUsPage,agentPage,buySaleRentPage,propertyDetailsPage,searchPropertyPage,contactUsEnquirePost,contactUsPage,contactUsPagePost

});

