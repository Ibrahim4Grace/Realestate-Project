const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');

const { 
     adminloginPage,adminloginPagePost,adminDashboard,adminPage,uploads,adminPagePost,allAdmin,viewAdminProfile,editAdminProfile,editAdminProfilePost,deleteAdminProfile,myAgentsPage,upl,myAgentsPagePost,allAgentsPage,moreAboutAgent,editAgentPage,editAgentPagePost, deleteAgent,addNewProperty,upload,addNewPropertyPost, myProperties,searchProperties,moreAboutProperty,editPropertyPage,editPropertyPagePost, deleteProperty,contactUsPage,deleteContactUs,houseEnquireforum,deletecontactEnquire,adminLogout


} = require('../controller/backendController');

router.get('/adminlogin', checkNotAuthenticated,adminloginPage);
router.post('/adminloginPagePost',checkNotAuthenticated, adminloginPagePost);
router.get('/dashboard',checkAuthenticated, adminDashboard);
router.get('/admin',checkAuthenticated, adminPage);
router.post('/adminPagePost',checkAuthenticated, uploads.single('image'),adminPagePost);
router.get('/allAdmin',checkAuthenticated, allAdmin);
router.get('/viewAdminProfile/:m_id', checkAuthenticated, viewAdminProfile);
router.get('/editAdmin/:m_id', checkAuthenticated, editAdminProfile);
router.post('/editAdminProfilePost/:mu_id', checkAuthenticated, uploads.single('image'), editAdminProfilePost);
router.get('/deleteAdminProfile/:mu_id', checkAuthenticated, deleteAdminProfile);
router.get('/addAgent',checkAuthenticated, myAgentsPage);
router.post('/myAgentsPagePost',checkAuthenticated, upl.single('image'), myAgentsPagePost);
router.get('/allAgents',checkAuthenticated, allAgentsPage);
router.get('/moreAboutAgent/:m_id', checkAuthenticated, moreAboutAgent);
router.get('/editAgent/:m_id', checkAuthenticated, editAgentPage);
router.post('/editAgentPagePost/:mu_id', checkAuthenticated, upl.single('image'), editAgentPagePost);
router.get('/deleteAgent/:m_id', checkAuthenticated, deleteAgent);
router.get('/addNewProperty',checkAuthenticated, addNewProperty);
router.post('/addNewPropertyPost', checkAuthenticated, upload.array('images'), addNewPropertyPost);
router.get('/myProperties',checkAuthenticated, myProperties);
router.post('/searchProperties', checkAuthenticated, searchProperties);
router.get('/moreAboutProperty/:m_id',checkAuthenticated, moreAboutProperty);
router.get('/editProperty/:m_id', checkAuthenticated, editPropertyPage);
router.post('/editPropertyPagePost/:m_id', checkAuthenticated, upload.array('images'), editPropertyPagePost);
router.get('/deleteProperty/:m_id', checkAuthenticated, deleteProperty);
router.get('/contactUs', checkAuthenticated, contactUsPage);
router.get('/deleteContactUs/:m_id', checkAuthenticated, deleteContactUs);
router.get('/houseEnquireforum', checkAuthenticated, houseEnquireforum);
router.get('/deletecontactEnquire/:m_id', checkAuthenticated, deletecontactEnquire);
router.post('/logout', checkAuthenticated, adminLogout);






module.exports = router;
