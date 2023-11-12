const mongoose = require(`mongoose`);

const cSchema = new mongoose.Schema({

    flname: {
        type: String,
        required: true
    },  
    email: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    heading:{
        type: String,
        required: true
    },
    propertyType:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    countryCity:{
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date_added: {
        type: Date,
        default: Date.now()
    }

});

const cuSchema = new mongoose.Schema({

    flname: {
        type: String,
        required: true
    },  
    email: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date_added: {
        type: Date,
        default: Date.now()
    }

});


const ContactUsEnquire = mongoose.model('askingAboutHouse', cSchema);
const ContactUs = mongoose.model('ContactUs', cuSchema);


module.exports = {
    ContactUsEnquire,
    ContactUs
};
