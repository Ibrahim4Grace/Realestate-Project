
const express = require(`express`)
const router = express.Router();
const mongoose = require(`mongoose`);
const session = require('express-session');
const flash = require('express-flash');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const nodemailer = require(`nodemailer`);
const passport = require('passport');

const ejs = require(`ejs`);
const Admin = require('../models/admin');
const Properties  = require('../models/property');
const OurAgent  = require('../models/agent');
const { ContactUsEnquire, ContactUs } = require('../models/contact');


// Passport config
const initializePassport = require('../config/passport');

initializePassport(passport, async (adminUsername) => {
  try {
    const admin = await Admin.find({ adminUsername: adminUsername });
    return admin;
  } catch (error) {
    // Handle any errors here
    console.error(error);
    return null;
  }
});

// Send email to the applicant
const transporter = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

//admin login 
const adminloginPage = (req, res) => {
  res.render('backend/adminlogin');
};

const adminloginPagePost = (req, res, next) => {
  passport.authenticate('local-admin', {
      successRedirect: '/backend/dashboard',
      failureRedirect: '/backend/adminlogin',
      failureFlash: true,
  })(req, res, next);
};

// const adminDashboard = async (req, res) => {
//     try {
       
//         const admin = await Admin.findById(req.user);
  
//         if (admin) {
//             const name = admin.fullName; 
//             res.render('dashboard', { name });
//         } else {
//             res.render('dashboard', { name: 'Guest' }); // Handle the case where the admin is not found
//         }
//     } catch (error) {
//         console.error(error);
//         res.render('dashboard', { name: 'Guest' }); // Handle errors gracefully
//     }
// };

const adminDashboard = async (req, res) => {
  // Access the authenticated admin user
  const admin = req.user;
  res.render('backend/dashboard', { admin, });
};

const adminPage = async (req, res) => {
  const admin = req.user;
  res.render('backend/admin', { admin,  });
};

//IF WE WANT OUR IMAGES TO GO INOT DIFFERENT FOLDER
let stor = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public/adminImage/')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + Date.now())
  }
});
const uploads = multer({ storage: stor });

const adminPagePost = async (req, res) => {

  const { adminFullName, adminUsername, adminPassword, adminPassword2, adminEmail, adminNumber, adminAddress, adminCity, adminState, adminRole, adminDob, adminEmergencyName, adminEmergencyNumber, adminEmployDate } = req.body;
    const admin = req.user;
    let errors = [];

    //check required fields
    if (!adminFullName || !adminUsername || !adminPassword || !adminPassword2 || !adminEmail || !adminNumber || !adminAddress || !adminCity || !adminState || !adminRole || !adminDob || !adminEmergencyName || !adminEmergencyNumber || !adminEmployDate) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //check passwords match
    if (adminPassword !== adminPassword2) { errors.push({ msg: 'Password do not match' }); }

    //Check password length
    if (adminPassword.length < 6) { errors.push({ msg: 'Password should be at least 6 characters' }); }

    //if all check complete
    if (errors.length > 0) {
        return res.render('backend/admin', {
            errors,
            adminFullName,
            adminUsername,
            adminPassword,
            adminPassword2,
            adminAddress,
            adminNumber,
            adminEmail,
            adminRole,
            admin,
        });
    }

    try {

        
        const adminExists = await Admin.findOne({ $or: [{ adminEmail: adminEmail }, { adminUsername: adminUsername }] });
        if (adminExists) {
            // Either email or username is already registered
            if (adminExists.adminEmail === adminEmail) {
              errors.push({ msg: 'Email already registered' });
            }
            if (adminExists.adminUsername === adminUsername) {
              errors.push({ msg: 'Username already registered' });
            }
          }

        const hash = await bcrypt.hash(adminPassword, 10);

        const newAdmin = new Admin({
            adminFullName,
            adminUsername,
            adminPassword: hash,
            adminEmail,
            adminNumber,
            adminAddress,
            adminCity,
            adminState,
            adminRole,
            adminDob,
            adminEmergencyName,
            adminEmergencyNumber,
            adminEmployDate,
            image: {
                data: fs.readFileSync(path.join(__dirname, '../public/adminImage/' + req.file.filename)),
                contentType: 'image/png'
            },
            admin,
        });

        await newAdmin.save();

            let phoneNumber = process.env.COMPANY_NUMBER;
            let emailAddress = process.env.COMPANY_EMAIL;
            let companyAddress = process.env.COMPANY_ADDRESS;


        // Your email sending code here
        let msg = `
        <p><img src="cid:estate" alt="Company Logo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
            <p>Dear   ${adminFullName} ,   We are thrilled to welcome you to Korex RealEstate Service. Your expertise and dedication to the field have truly impressed us, and we are eager to embark on this journey together.</p>

            <p>Here are some important details to get you started:</p>
            <ul>
                <li>Full Name: ${adminFullName}</li>
                <li>Username: ${adminUsername}</li>
                <li>Phone Number: ${adminNumber}</li>
                <li>Email: ${adminEmail}</li>
                <li>Address: ${adminAddress}</li>
                <li>City: ${adminCity}</li>
                <li>State: ${adminState}</li>
                <li>Role: ${adminRole}</li>
                <li>Emergency Name: ${adminEmergencyName}</li>
                <li>Emergency Number : ${adminEmergencyNumber}</li>
            </ul>

            <p>We are delighted to welcome you to our platform.</p>

            <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>

            <p>Thank you for your prompt attention to this matter. We appreciate your trust in our services and we are here to assist you with any further inquiries you may have..</p>

            <p>Best regards,<br>
            The Korex RealEstate Team<br>
            ${companyAddress}</p>`;

        const mailOptions = {
            from: process.env.NODEMAILER_EMAIL,
            to: adminEmail,
            subject: 'Welcome to Korex RealEstate!',
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

        req.flash('success_msg', 'Dear ' + adminFullName + ', Your account has been successfully created.');
        res.redirect('/backend/allAdmin');
    } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while processing your request.');
        res.redirect('/backend/dashboard');
    }
};

const allAdmin = async (req, res) => {
  try {
    const admin = req.user;

    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page
    const totalPosts = await Admin.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
  
    const adminResults = await Admin.find()
        .sort({ date_added: -1 }) // Sort by
        .skip((page - 1) * perPage)
        .limit(perPage);
    res.render('backend/allAdmin', { adminResults, admin, totalPages, currentPage: page });
    
  }catch (err) {
    console.error(err);
    res.redirect('backend/dashboard');
  } 
};

const viewAdminProfile = async (req, res) => {
  try {
    const admin = req.user;
    const adminId  = req.params.m_id;
    const adminProfile = await Admin.findOne({ _id: adminId });

    if (!adminProfile) {
        return res.status(404).send(`Admin profile not found`);
    }
    res.render(`backend/viewAdminProfile`, { adminProfile, admin });
  } catch (err) {
    console.error(err);
    res.status(500).send(`There's a problem selecting from DB`);
  }
};

const editAdminProfile = async (req, res) => {
  const admin = req.user;
  const prop = Admin.findOne({ _id: req.params.m_id })
  .then((recs) => {
    res.render(`backend/editAdmin`, { admin, adminResults: recs })
  })
  .catch((err) => {
    res.send(`There's a problem selecting from DB`);
    res.redirect('/backend/admin');
    console.error(err);
  }) 
};

const editAdminProfilePost = async (req, res) => { 
  try {
    const admin = req.user;
    let errors = [];
    const mu_id = req.params.mu_id;

    const { adminFullName, adminUsername, adminPassword, adminEmail, adminNumber, adminAddress, adminCity, adminState, adminRole, adminDob, adminEmergencyName, adminEmergencyNumber } = req.body;

    // Check if a new image was uploaded
    let newImage = {};
    if (req.file) {
        newImage = {
            data: fs.readFileSync(path.join(__dirname, '../public/adminImage/' + req.file.filename)),
            contentType: 'image/png',
        };
    }

    // Find the existing admin to get the current image
    const existingAdmin = await Admin.findById(mu_id);

    // Retain the existing image or use the new image
    const adminImage = req.file ? newImage : (existingAdmin ? existingAdmin.image : {});

    // Hash the new password if it has been changed
    let adminPasswordHash;
    if (adminPassword && adminPassword !== existingAdmin.adminPassword) {
        adminPasswordHash = bcrypt.hashSync(adminPassword, 10);
    } else {
        // If the password hasn't changed, retain the existing hashed password
        adminPasswordHash = existingAdmin.adminPassword;
    }

    // Update the document with the hashed password
    await Admin.findByIdAndUpdate(mu_id, {
        $set: {
            adminFullName,
            adminUsername,
            adminPassword: adminPasswordHash, // Update the password only if it has changed
            adminEmail,
            adminNumber,
            adminAddress,
            adminCity,
            adminState,
            adminRole,
            adminDob,
            adminEmergencyName,
            adminEmergencyNumber,
            image: adminImage, // Use the existing or new image
            admin,
        }
    });

    let phoneNumber = process.env.COMPANY_NUMBER;
    let emailAddress = process.env.COMPANY_EMAIL;
    let companyAddress = process.env.COMPANY_ADDRESS;

    let msg = `
    <p><img src="cid:estate" alt="Company Logo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear ${adminFullName}, We wanted to inform you that there has been an update to your information in our database. The details that have been modified include:</p>

    <p>New Information:</p>
    <ul>
        <li>Full Name: ${adminFullName}</li>
        <li>Username: ${adminUsername}</li>
        <li>Email Address: ${adminEmail}</li>
        <li>Phone Number: ${adminNumber}</li>
        <li>Home Address: ${adminAddress}</li>
        <li>City: ${adminCity}</li>
        <li>State: ${adminState}</li>
        <li>Role: ${adminRole}</li>
        <li>Emergency Name : ${adminEmergencyName}</li>
        <li>Emergency Number : ${adminEmergencyNumber}</li>
    </ul>

    <p>Please review the changes to ensure that they accurately reflect your information. If you believe any information is incorrect or if you have any questions regarding the update, please don't hesitate to reach out to our administrative team at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>.</p>

    <p>We value your continued association with us, and it's important to us that your records are kept up-to-date for your convenience and our records.</p>

    <p>Thank you for your prompt attention to this matter. We appreciate your trust in our services and are here to assist you with any further inquiries you may have.</p>

    <p>Best regards,<br>
    The Korex RealEstate Team<br>
    ${companyAddress}</p>`;

    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: adminEmail,
        subject: 'Information Update Confirmation',
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
    req.flash('success_msg', 'Dear ' + adminFullName + ', Your Information Successfully Updated');
    res.redirect('/backend/allAdmin');
} catch (error) {
    console.error('Error updating admin:', error);
    req.flash('error_msg', 'An error occurred while updating admin information.');
    res.redirect('/backend/dashboard'); 
}
};

const deleteAdminProfile = (req, res) => {
  const mu_id = req.params.mu_id;
  Admin.findByIdAndDelete(mu_id)
  .then(() => {
      req.flash(`success_msg`, 'Admin deleted successfully');
      res.redirect(`/backend/Admin`)
  })
  .catch((error) => {
      console.error('Error deleting admin:', error);
      req.flash('error_msg', 'Error deleting admin');
      res.redirect('/backend/dashboard');
  })

};

const myAgentsPage = async (req, res) => {
  const admin = req.user;
  res.render('backend/addAgent' , { admin });
};

//IF WE WANT OUR IMAGES TO GO INOT DIFFERENT FOLDER
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public/agentImage/');
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + Date.now());
  },
});
const upl = multer({ storage: storage, });

const myAgentsPagePost = async (req, res) => {
  const { agentName, agentEmail, agentNumber, agentPosition, agentAddress, emergencyName, emergencyNumber,employDate,agentBio } = req.body;
  const admin = req.user;
  let errors = [];

    //check required fields
    if (!agentName || !agentEmail || !agentNumber || !agentPosition || !agentAddress || !emergencyName || !emergencyNumber ||     !employDate ||!agentBio ||!req.file)  {
      errors.push({ msg: 'Please fill in all fields and upload an image' });
    }

      //if all check complete
      if (errors.length > 0) {
        return res.render('backend/addAgent', {
          errors,
          agentName,
          agentEmail,
          agentNumber,
          agentPosition,
          agentAddress,
          emergencyName,
          emergencyNumber,
          employDate,
          agentBio,
          admin,
        });
      }
      try {

        const agentExists = await OurAgent.findOne({ agentEmail:agentEmail });
        if (agentExists) {
          errors.push({ msg: 'Email already registered' });
        }

        const newOurAgent = new OurAgent({
          agentName,
          agentEmail,
          agentNumber,
          agentPosition,
          agentAddress,
          emergencyName,
          emergencyNumber,
          employDate,
          agentBio,
          image: {
            data: fs.readFileSync(path.join(__dirname, '../public/agentImage/' + req.file.filename)),
            contentType: 'image/png'
          },
          admin,
        });

        newOurAgent.save();

          // Your email sending code here
          const  phoneNumber = process.env.COMPANY_NUMBER;
          const emailAddress = process.env.COMPANY_EMAIL;
          const companyAddress = process.env.COMPANY_ADDRESS;
			
			
          let msg = `
          <p><img src="cid:estate" alt="Company Logo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
          <p>Dear ${agentName}, We hope this email finds you well. We are delighted to welcome you to Korex RealEstate team as our newest Real Estate Agent. Your expertise and dedication to the field have truly impressed us, and we are eager to embark on this journey together..</p>
     
        
          <p> Please take a moment to review the following details of your employment with Korex RealEstate Company:</p>
          <ul>
            <li>Full Name: ${agentName}</li>
            <li>Email: ${agentPosition}</li>
            <li>Resumption Date: ${employDate}</li>
            <li>Email: ${agentEmail}</li>
            <li>Number: ${agentNumber}</li>
            <li>Position: ${agentPosition}</li>
            <li>Home Address: ${agentAddress}</li>
            <li>Emergency Name: ${emergencyName}</li>
            <li>Emergency Number: ${emergencyNumber}</li>
            <li>Ofiice Address: ${companyAddress}</li>
          </ul>

          <p>Code of Conduct: You will be provided with our company's Code of Conduct and Employee Handbook. Please review these documents carefully and adhere to our professional standards..</p> 
		 
          <p>We believe that your skills and experience will make a significant contribution to our continued success. As a Real Estate Agent, you will play a vital role in helping clients find their dream homes and navigate the intricacies of real estate transactions..</p> 
		  
          <p>At Korex RealEstate, we prioritize professionalism, integrity, and exceptional customer service. We are confident that you share these values and will uphold them in your interactions with clients, colleagues, and partners..</p>
          
         <p>If you have any questions or require further information before your start date, please feel free to contact us directly at <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>. Your satisfaction is important to us, and we are here to assist you</p>
        
         <p>Once again, welcome to the Korex RealEstate family. We look forward to a prosperous and successful partnership.</p>
     
         <p>Best regards,<br>
         The Korex RealEstate Team<br>
         ${companyAddress}</p>`;
		 
         const mailOptions = {
          from: process.env.NODEMAILER_EMAIL,
          to: agentEmail,
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
            console.error('Email sending error:', error);
            req.flash('error', 'An error occurred while sending the welcome email.');
          } else {
            console.log('Email sent:', info.response);
          }
        });
        req.flash('success_msg', 'Dear ' + agentName + ', Your account has been successfully created.');
        res.redirect('/backend/allAgents');
      } catch (error) {
        console.error(error);
        req.flash('error', 'An error occurred while processing your request. Please try again later.');
        res.redirect('/backend/dashboard');
      }
};

const allAgentsPage = async (req, res) => {
  try {
    const admin = req.user;

    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page
    const totalPosts = await OurAgent.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
  
    const agent = await OurAgent.find()
        .sort({ date_added: -1 }) // Sort by
        .skip((page - 1) * perPage)
        .limit(perPage);
    res.render('backend/allAgents', { agent, admin, totalPages, currentPage: page });
  }catch (err) {
    console.error(err);
    res.redirect('backend/dashboard');
  } 
};

const moreAboutAgent = async (req, res) => {
  try {
    const admin = req.user;
    const ourAgentId = req.params.m_id;
  
    const ourAgent = await OurAgent.findOne({ _id: ourAgentId });
    if (!ourAgent) {
      return res.status(404).send(`Appointment not found`);
    }
      // Render the viewAppoint page with appointment details
      res.render(`backend/moreAboutAgent`, { ourAgent,admin });
    } catch (err) {
      console.error(err);
      res.status(500).send(`There's a problem selecting from DB`);
    }
};

const editAgentPage =  (req, res) => {
  const admin = req.user
  const prop = OurAgent.findOne({ _id: req.params.m_id })
  .then((recs) => {
    res.render(`backend/editAgent`, { admin,agent: recs })
  })
  .catch((err) => {
    res.send(`There's a problem selecting from DB`);
    res.redirect('/backend/dashboard');
    console.error(err);
  })
};

const editAgentPagePost = async (req, res) => {
  try {
    const admin = req.user;
    let errors = [];
    const mu_id = req.params.mu_id;

    const { agentName, agentEmail, agentNumber, agentPosition, agentAddress, emergencyName, emergencyNumber,employDate,agentBio } = req.body;

    // Check if a new image was uploaded
    let newImage = {};
    if (req.file) {
        newImage = {
            data: fs.readFileSync(path.join(__dirname, '../public/agentImage/' + req.file.filename)),
            contentType: 'image/png',
        };
    }

    // Find the existing agent to get the current image
    const existingAgent = await OurAgent.findById(mu_id);
    // Retain the existing image or use the new image
    const agentImage = req.file ? newImage : (existingAgent ? existingAgent.image : {});

    // Update the document with the hashed password
    await OurAgent.findByIdAndUpdate(mu_id, {
        $set: {
          agentName,
          agentEmail,
          agentNumber,
          agentPosition,
          agentAddress,
          emergencyName,
          emergencyName,
          emergencyNumber,
          employDate,
          agentBio,
          image: agentImage, // Use the existing or new image
          admin,
        }
    });

    let phoneNumber = process.env.COMPANY_NUMBER;
    let emailAddress = process.env.COMPANY_EMAIL;
    let companyAddress = process.env.COMPANY_ADDRESS;

    let msg = `
    <p><img src="cid:estate" alt="Company Logo" style="width: 100%; max-width: 600px; height: auto;"/></p><br>
    <p>Dear ${agentName}, We hope this message finds you well. We wanted to inform you about a recent update regarding your information. Here are the details of the update.</p>

    <p>New Information:</p>
    <ul>
        <li>Full Name: ${agentName}</li>
        <li>Email Address: ${agentEmail}</li>
        <li>Phone Number: ${agentNumber}</li>
        <li>Position: ${agentPosition}</li>
        <li>Home Address: ${agentAddress}</li>
        <li>Emergency Name: ${emergencyName}</li>
        <li>Emergency Number: ${emergencyNumber}</li>
    </ul>

    <p>If you have any questions or concerns regarding this update, please don't hesitate to contact Korex RealEstateat <a href="tel:${phoneNumber}">${phoneNumber}</a> or <a href="mailto:${emailAddress}">${emailAddress}</a>.</p>

    <p>We appreciate your continued dedication and hard work as a member of our RealEstate team.</p>

    <p>Best regards,<br>
    The Korex RealEstate Team<br>
    ${companyAddress}</p>`;

    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: agentEmail,
        subject: 'Information Update Confirmation',
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
    req.flash('success_msg', 'Dear ' + agentName + ', Your Information Successfully Updated');
    res.redirect('/backend/allAgents');
} catch (error) {
    console.error('Error updating admin:', error);
    req.flash('error_msg', 'An error occurred while updating agent information.');
    res.redirect('/backend/dashboard'); 
}
};

const deleteAgent = (req, res) => {
  const mid = req.params.m_id;
  OurAgent.findByIdAndDelete(mid)
  .then(() => {
    req.flash(`success_msg`, 'Agent deleted successfully');
    res.redirect(`/backend/allAgents`)
  })
  .catch(() => {
    res.send(`error`)
  })
};

const addNewProperty = async (req, res) => {
  const admin = req.user;
  try {
    const ourAgent = await OurAgent.find();
    res.render(`backend/addNewProperty`, { admin, ourAgent });
  } catch (error) {
    console.error(error);
    req.flash('error', 'An error occurred while rendering the addNewProperty page');
    res.redirect('/backend/dashboard');
  }
};


//IF WE WANT OUR IMAGES TO GO INOT DIFFERENT FOLDER
let st = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './public/houseImage/');
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '_' + Date.now());
  },
});
const upload = multer({ storage: st });

const addNewPropertyPost = async (req, res) => {
  try{
    const admin = req.user
    let errors = [];

    const { contactPerson, propertyType, amount, houseCondition, propertyStatus,agentNumber,address,city,state,country,heading,  sizeinFt,bedrooms,bathrooms,garages,pool,yearBuilt,availableFrom,description} = req.body;

      //check required fields
      if (!contactPerson || !propertyType || !amount || !houseCondition || !propertyStatus || !agentNumber || !address || !city ||!state ||!country || !heading || !sizeinFt || !availableFrom || !description)  {
        errors.push({ msg: 'Please fill in all fields and upload an image' });
      }
      
      const MAX_IMAGES_ALLOWED = process.env.MAX_IMAGES_ALLOWED || 5;

      // Check if images were uploaded
    if (!req.files || req.files.length === 0 || req.files.length >= MAX_IMAGES_ALLOWED) {
      errors.push({ msg: `Please upload at least one image or maximum ${MAX_IMAGES_ALLOWED} images.` });
    }

      

      const newProperties = new Properties({

        contactPerson, propertyType,amount, houseCondition,propertyStatus, agentNumber, 
        address, city,state,country, heading,sizeinFt,bedrooms,bathrooms,garages,pool,
        yearBuilt, availableFrom,description,admin,
        images: req.files.map((file) => ({
          data: fs.readFileSync(path.join(__dirname, '../public/houseImage/' + file.filename)),
          contentType: 'image/png', 
        }))      
      })

      await newProperties.save();

      req.flash('success_msg', 'Property added successfully');
      res.redirect('/backend/myProperties');
    }catch (error) {
      console.error(error);
      req.flash('error', 'An error occurred while adding the property');
      res.redirect('/backend/addNewProperty');
    }
};

const myProperties = async (req, res) => {
  try {
    const admin = req.user;

    const page = parseInt(req.query.page) || 1;
    const perPage = 5; // Number of items per page
    const totalPosts = await Properties.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);
  
    const properties = await Properties.find()
        .sort({ date_added: -1 }) // Sort by
        .skip((page - 1) * perPage)
        .limit(perPage);
    res.render('backend/myProperties', { properties, admin, totalPages, currentPage: page });
  }catch (err) {
    console.error(err);
    res.redirect('backend/dashboard');
  }
};


module.exports = ({
  adminloginPage,adminloginPagePost,adminDashboard,adminPage,uploads,adminPagePost,allAdmin,viewAdminProfile,editAdminProfile,editAdminProfilePost,deleteAdminProfile,myAgentsPage,upl,myAgentsPagePost,allAgentsPage,moreAboutAgent,editAgentPage,editAgentPagePost,deleteAgent,addNewProperty,upload,addNewPropertyPost,myProperties



});

