const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');

const { 
    landingPage,aboutUsPage,agentPage,buySaleRentPage,propertyDetailsPage,searchPropertyPage,contactUsEnquirePost,contactUsPage,contactUsPagePost

} = require('../controller/frontendController');

router.get('/', checkNotAuthenticated, landingPage);
router.get('/about', checkNotAuthenticated, aboutUsPage);
router.get('/agent', checkNotAuthenticated, agentPage);
router.get('/buysalerent', checkNotAuthenticated, buySaleRentPage);
router.get('/property-detail/:_id', checkNotAuthenticated, propertyDetailsPage);
router.post('/searchPropertyPage', checkAuthenticated, searchPropertyPage);
router.post('/contactUsEnquirePost/:m_id/:heading/:propertyType/:address/:countryCity', checkAuthenticated, contactUsEnquirePost);
router.get('/contact', checkNotAuthenticated, contactUsPage);
router.post('/contactUsPagePost', checkAuthenticated, contactUsPagePost);



module.exports = router;
