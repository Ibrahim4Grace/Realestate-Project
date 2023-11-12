
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


router.get(`/addNewProperty`, checkAuthenticated, (req, res) => {

    res.render(`addNewProperty`);
});

//IF WE WANT OUR IMAGES TO GO INOT DIFFERENT FOLDER
let st = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/houseImage/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now());
    },
});
const upload = multer({ storage: st });


router.post(`/addNewProperty`, checkAuthenticated,  upload.array('images', 3),(req, res) => {

    // USING DATA destructuring
    const { contactPerson, description, propertyType, amount, houseCondition, tax, propertyStatus,agentNumber,address,countryState,countryCity,country,sizeinFt,heading,rooms,bedrooms,bathrooms,garages,garageSize,yearBuilt,availableFrom,basement,roofing,exteriorMaterial } = req.body;


    //check required fields
    if (!contactPerson || !description || !propertyType || !amount || !houseCondition || !tax || !propertyStatus || !agentNumber || !address || !countryState || !countryCity || !country || !sizeinFt || !heading || !rooms || !bedrooms || !bathrooms || !garages || !garageSize || !yearBuilt || !availableFrom || !basement || !roofing || !exteriorMaterial ) {
        req.flash(`error`, `Please fill all fields`);
        res.redirect(`/addNewProperty`);
    }  // Check if an image was uploaded
   
     else {

        const newProperties = new Properties({

            contactPerson, description, 
            propertyType, amount, 
            houseCondition, tax, 
            propertyStatus, agentNumber,
            address,countryState,
            countryCity,country,
            sizeinFt,heading,
            rooms,bedrooms,
            bathrooms,garages,
            garageSize,yearBuilt,
            availableFrom,basement,
            roofing,exteriorMaterial ,
              images: req.files.map((file) => ({
                data: fs.readFileSync(path.join(__dirname, '../public/images/houseImage/' + file.filename)),
                contentType: 'image/png', // You can determine the content type based on the file type if needed
              }))
                
        })

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

router.get(`/myAgents`, checkAuthenticated, async (req, res) => {


    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page
    const totalPosts = await OurAgent.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    const agent = await OurAgent.find()
        .skip((page - 1) * perPage)
        .limit(perPage);

    res.render('myAgents', { agent, totalPages, currentPage: page });

   
});

//IF WE WANT OUR IMAGES TO GO INOT DIFFERENT FOLDER
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/agentImage/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now());
    },
});
const upl = multer({ storage: storage, });


router.post(`/myAgents`, checkAuthenticated, upl.single('image'), (req, res) => {

    console.log('req.file:', req.file); // Add this line for debugging

    // Check if a file was uploaded successfully
    if (!req.file) {
        req.flash('error', 'Please upload an image');
        return res.redirect('/myAgents');
    }

    // USING DATA destructuring
    const { agentName, agentEmail, agentNumber, agentPosition, agentAddress, emergencyName, emergencyNumber,employDate,agentDetails } = req.body;


    //check required fields
    if (!agentName || !agentEmail || !agentNumber || !agentPosition || !agentAddress || !emergencyName || !emergencyNumber || !employDate ||!agentDetails) {
        req.flash(`error`, `Please fill all fields`);
        res.redirect(`/myAgents`);
    } else {

        const newOurAgent = new OurAgent({

           
            agentName,
            agentEmail,
            agentNumber,
            agentPosition,
            agentAddress,
            emergencyName,
            emergencyNumber,
            employDate,
            agentDetails,  
            image: {
                data: fs.readFileSync(path.join('./public/images/agentImage/' + req.file.filename)),
                contentType: 'image/png'
            }
        });

        //TO SAVE INTO DATABASE INPUT
        try {
            newOurAgent.save();
      
            let msg =
                'Dear ' + agentName + "\n\n" +

                 "I hope this email finds you well. We are delighted to welcome you to Korex RealEstate team as our newest Real Estate Agent. Your expertise and dedication to the field have truly impressed us, and we are eager to embark on this journey together..\n\n" +

                "Please take a moment to review the following details of your employment with Korex RealEstate Company:\n\n" +

                "Position: " + agentPosition + "\n" +
                "Start Date: " + employDate + "\n" +
                "Office Location: 6 Akinde Estate Alakuko Lagos \n\n" +
                
                "Code of Conduct: You will be provided with our company's Code of Conduct and Employee Handbook. Please review these documents carefully and adhere to our professional standards..\n\n" +
                
                "Training and Onboarding: Our team will ensure that you receive comprehensive training and onboarding to familiarize yourself with our systems, processes, and company culture..\n\n" +

                "We believe that your skills and experience will make a significant contribution to our continued success. As a Real Estate Agent, you will play a vital role in helping clients find their dream homes and navigate the intricacies of real estate transactions.\n\n" +

                "At Korex RealEstate, we prioritize professionalism, integrity, and exceptional customer service. We are confident that you share these values and will uphold them in your interactions with clients, colleagues, and partners..\n\n" +

                "If you have any questions or require further information before your start date, please do not hesitate to reach out to Mr Akorede Ibrahim at ibrahim4grace@gmail.com or 2347033731378..\n\n" +

                "Once again, welcome to the Korex RealEstate family. We look forward to a prosperous and successful partnership...\n\n" +

                 "Best regards,\n" +
                 "Korex RealEstate Team";


            const mailOptions = {
                from: 'ibro4grace@gmail.com',
                to: agentEmail,
                subject: 'Welcome to Korex RealEstate ',
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
            req.flash('success_msg', 'Agent Added Successfully');
            res.redirect('/myAgents');
        } catch (err) {
            console.log(err);
            req.flash('error', 'An error occurred while adding agent');
            res.redirect('/dashboard');

        }
    }


});

router.get(`/editAgent/:m_id`, checkAuthenticated, (req, res) => {

    const prop = OurAgent.findOne({ _id: req.params.m_id })

        .then((recs) => {

            res.render(`editAgent`, { agent: recs })
        })

        .catch((err) => {

            res.send(`There's a problem selecting from DB`);
            res.redirect('/dashboard');
            console.log(err);
        })

   
});


router.post(`/editAgent/:mu_id`, checkAuthenticated, (req, res) => {
    let errors = [];

    const mu_id = req.params.mu_id;

    const { agentName, agentEmail, agentNumber, agentPosition, agentAddress, emergencyName, emergencyNumber,employDate,agentDetails } = req.body;

    OurAgent.findByIdAndUpdate(mu_id, { $set: { agentName, agentEmail, agentNumber, agentPosition, agentAddress, emergencyName, emergencyNumber, employDate,agentDetails } })

        .then(() => {

            let msg = 'Dear ' + agentName + `,\n\n` +

                `We hope this message finds you well. We wanted to inform you about a recent update regarding your information. Here are the details of the update:.\n\n` +

                'New Information:\n\n' +
                "Name: " + agentName + "\n" +
                "Email: " + agentEmail + "\n" +
                "PHone Number: " + agentNumber + "\n" +
                "Position: " + agentPosition + "\n" +
                "Home Address: " + agentAddress + "\n" +
                "Emergency Contact Name: " + emergencyName + "\n" +
                "Emergency Contact Number: " + emergencyNumber + "\n\n" +
             

                "If you have any questions or concerns regarding this update, please don't hesitate to contact Korex RealEstate at 2347033731378. We're here to assist you..\n\n" +

                "We appreciate your continued dedication and hard work as a member of our RealEstate team.\n\n" +

                "warm regards,\n" +
                "Korex RealEstate";

            const mailOptions = {
                from: 'ibro4grace@gmail.com',
                to: agentEmail,
                subject: 'Information Update Confirmation',
                text: msg,


            };


            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Email sending error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
            // res.send(`Successfully Edited`)
            req.flash(`success_msg`, 'Information Successfully Updated');
            res.redirect('/myAgents');

        })
        .catch((err) => {
            console.log(err)
            res.send(`There is issue with your information`)
            res.redirect('/dashboard');

        })



});

router.get(`/deleteAgent/:m_id`, checkAuthenticated, (req, res) => {


    const mid = req.params.m_id;
    OurAgent.findByIdAndDelete(mid)

        .then(() => {
            req.flash(`success_msg`, 'Agent deleted successfully');
            res.redirect(`/myAgents`)
        })
        .catch(() => {

            res.send(`error`)
        })
});


router.get(`/moreAboutAgent/:m_id`, checkAuthenticated, async (req, res) => {
    try {
        const ourAgentId = req.params.m_id;

        // Fetch patient appointment details based on the appointmentId
        const ourAgent = await OurAgent.findOne({ _id: ourAgentId });

        if (!ourAgent) {
            return res.status(404).send(`Appointment not found`);
        }

        // Render the viewAppoint page with appointment details
        res.render(`moreAboutAgent`, { ourAgent });
    } catch (err) {
        console.error(err);
        res.status(500).send(`There's a problem selecting from DB`);
    }
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


router.get(`/admin`, checkAuthenticated, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page
    const totalPosts = await Admin.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    let myAdminInfo = []; // Initialize myAdminInfo as an empty array

    try {
        myAdminInfo = await Admin.find()
            .skip((page - 1) * perPage)
            .limit(perPage);
    } catch (error) {
        console.error(error);
    }

    res.render('admin', { myAdminInfo, totalPages, currentPage: page });
});


  router.post('/admin', checkAuthenticated, (req, res) => {

    const { fullName, username, password, password2, adminAddress, adminNumber, role } = req.body;
    let errors = [];

    //check required fields
    if (!fullName || !username || !password || !password2 || !adminAddress || !adminNumber || !role) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //check passwords match
    if (password !== password2) {
        errors.push({ msg: 'Password do not match' });
    }

    //Check password length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    //if all check complet
    if (errors.length > 0) {
        res.render('admin', {
            errors,
            fullName,
            username,
            password,
            password2,
            adminAddress,
            adminNumber,
            role
        });

    } else {

        //Validation Passed
        Admin.findOne({ username: username })
            .then(admin => {
                if (admin) {
                    //User exist
                    errors.push({ msg: 'Username already registered' });
                    res.render('admin', {
                        errors,
                        fullName,
                        username,
                        password,
                        password2,
                        adminAddress,
                        adminNumber,
                        role
                    });

                } else {
                    const newAdmin = new Admin({
                        fullName,
                        username,
                        password,
                        adminAddress,
                        adminNumber,
                        role
                     
                    });
                    //IF YOU DONT WANT YOUR PASSWORD TO SAVE IN PLAIN TEXT USE HASH PASSWORD
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                        if (err) throw err;
                        //SET PASSWORD TO HASHED
                        newAdmin.password = hash;

                        //Save into DB
                        newAdmin.save()
                            .then(admin => {
                                req.flash('success_msg', 'Admin now registered..');
                                res.redirect('/admin');
                            })
                            .catch(err => {
                                
                                console.error(err);
                                res.redirect('/admin');
                            });
                           
                    }))

                }
            });
    }

  });


  
router.get(`/editAdmin/:m_id`, checkAuthenticated, (req, res) => {

    const prop = Admin.findOne({ _id: req.params.m_id })

        .then((recs) => {

            res.render(`editAdmin`, { adminResult: recs })
        })

        .catch((err) => {

            res.send(`There's a problem selecting from DB`);
            res.redirect('/admin');
            console.log(err);
        })

   
});


router.post(`/editAdmin/:mu_id`, checkAuthenticated, async (req, res) => {
    let errors = [];

    const mu_id = req.params.mu_id;

    const { fullName, username, password, adminAddress, adminNumber, role } = req.body;

  
        // Hash the new password
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    console.error(err);
                    res.send('Error hashing password');
                } else {
                    // Update the document with the hashed password
                    try {
                        await Admin.findByIdAndUpdate(mu_id, {
                            $set: {
                                fullName,
                                username,
                                password: hash, // Update with hashed password
                                adminAddress,
                                adminNumber,
                                role
                            }
                        });

                        req.flash('success_msg', 'Information Successfully Updated');
                        res.redirect('/admin');
                    } catch (error) {
                        console.error(error);
                        res.send('Error updating admin');
                    }
                }
            });
        });
   
});

router.get(`/deleteAdmin/:m_id`, checkAuthenticated, (req, res) => {

    const mid = req.params.m_id;
    Admin.findByIdAndDelete(mid)

        .then(() => {
            req.flash(`success_msg`, 'Admin deleted successfully');
            res.redirect(`/admin`)
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


//CHECKING IF ADMIN IS AUTHENTICATED WONT ALLOW YOU TO VISIT DASHBOARD IF YOU'RE NOT LOGIN
function checkAuthenticated(req, res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/logPage');
}

module.exports = router;




