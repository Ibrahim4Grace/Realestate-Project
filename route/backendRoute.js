const express = require('express');
const router = express.Router();
const {checkAuthenticated, checkNotAuthenticated} = require ('../middleware/authentication');

const { 
     adminloginPage,adminloginPagePost,adminDashboard,adminPage,uploads,adminPagePost,allAdmin,viewAdminProfile,editAdminProfile,editAdminProfilePost,deleteAdminProfile,myAgentsPage,upl,myAgentsPagePost,allAgentsPage,moreAboutAgent,editAgentPage,editAgentPagePost, deleteAgent,addNewProperty,upload,addNewPropertyPost, myProperties


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
router.post('/addNewPropertyPost', checkAuthenticated, upload.array('image'), addNewPropertyPost);
router.get('/myProperties',checkAuthenticated, myProperties);

// router.get('/admin', checkAuthenticated, adminSection);
// router.post('/addNewAdminPost', checkAuthenticated, uploads.single('image'), addNewAdminPost);
// router.get('/editAdmin/:m_id', checkAuthenticated, editAdmininformation);
// router.post('/editAdmin/:mu_id', checkAuthenticated, uploads.single('image'), editAdmininformationPost);
// router.get('/deleteAdminProfile/:mu_id', checkAuthenticated, deleteAdminProfile);
// router.get('/patientAppointment', checkAuthenticated, appointmentSection);
// router.post('/searchAppointment', checkAuthenticated, searchAppointment);
// router.get('/viewAppoint/:m_id', checkAuthenticated, viewAppointment);
// router.get('/appoint-edit/:m_id', checkAuthenticated, editAppointment);
// router.post('/editAppointmentPost/:mu_id', checkAuthenticated,  editAppointmentPost);
// router.get('/deleteAppointment/:mu_id', checkAuthenticated, deleteAppointment);
// router.get('/addDoctor', checkAuthenticated, addDoctor);
// router.post('/addDoctorPost', checkAuthenticated, upload.single('image'), addDoctorPost);
// router.get('/allDoctor', checkAuthenticated, allDoctor);
// router.post('/searchDoctor', checkAuthenticated, searchDoctor);
// router.get('/doctorProfile/:mu_id', checkAuthenticated, doctorProfile);
// router.get('/edit-doctor/:mu_id', checkAuthenticated, editDoctor);
// router.post('/editDoctorProfilePost/:mu_id', checkAuthenticated, upload.single('image'), editDoctorProfilePost);
// router.get('/deleteDoctorProfile/:mu_id', checkAuthenticated, deleteDoctorProfile);
// router.get('/addPatient', checkAuthenticated, addPatient);
// router.post('/addPatientPost', checkAuthenticated, upl.single('image'), addPatientPost);
// router.get('/allpatients', checkAuthenticated, registeredPatients);
// router.post('/searchPatient', checkAuthenticated, searchPatient);
// router.get('/viewPatient/:m_id', checkAuthenticated, viewAllPatients);
// router.get('/editPatient/:m_id', checkAuthenticated, editPatient)
// router.post('/editPatientPost/:mu_id', checkAuthenticated, upl.single('image'), editPatientPost);
// router.get('/addmedicalrecord/:m_id', checkAuthenticated, addMedicalRecord)
// router.post('/addMedicalRecordPost/:m_id', checkAuthenticated, addMedicalRecordPost);
// router.get('/deleteRegisteredPatient/:mu_id', checkAuthenticated, deleteRegisteredPatient);
// router.get('/unregis_patient', checkAuthenticated, unregisteredPatients)
// router.post('/searchUnregisterPatient', checkAuthenticated, searchUnregisterPatient);
// router.get('/registerPatient/:id', checkAuthenticated, registerPatient)
// router.get('/deleteUnregisteredPatient/:m_id', checkAuthenticated, deleteUnregisteredPatient);
// router.get('/patientPayment', checkAuthenticated, patientPayment);
// router.post('/patientPaymentPost', checkAuthenticated,  patientPaymentPost);
// router.post('/searchPatientPay', checkAuthenticated, searchPatientPay);
// router.get('/deletePatientPayment/:mu_id', checkAuthenticated, deletePatientPayment);
// router.get('/doctorPayment', checkAuthenticated, doctorPayment);
// router.post('/doctorPaymentPost', checkAuthenticated,  doctorPaymentPost);
// router.post('/searchDoctorPayment', checkAuthenticated, searchDoctorPayment);
// router.get('/editDoctorPayment/:m_id', checkAuthenticated, editDoctorPayment)
// router.post('/editDoctorPaymentPost/:mu_id', checkAuthenticated,  editDoctorPaymentPost);
// router.get('/deleteDoctorPay/:mu_id', checkAuthenticated, deleteDoctorPay);
// router.get('/hospitalExpenses', checkAuthenticated, hospitalExpenses);
// router.post('/hospitalExpensesPost', checkAuthenticated, upld.single('image'),  hospitalExpensesPost);
// router.post('/searchHospitalExpenses', checkAuthenticated, searchHospitalExpenses);
// router.get('/editHospiExpense/:m_id', checkAuthenticated, editHospiExpenses)
// router.post('/editHospiExpensePost/:mu_id', checkAuthenticated, editHospiExpensePost);
// router.get('/deletehospital/:mu_id', checkAuthenticated, deletehospital);
// router.post('/logout', checkAuthenticated, adminLogout);



module.exports = router;
