const mongoose = require(`mongoose`);

const imageSchema = new mongoose.Schema({
    data: Buffer,
    contentType: String
});

const pSchema = new mongoose.Schema({

    contactPerson: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    propertyType: {
        type: String,
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    houseCondition: {
        type: String,
        required: true
    },
    tax: {
        type: String,
        required: true
    },
    propertyStatus: {
        type: String,
        required: true
    },
    agentNumber: {
        type: String,
        required: true
    },
    images: [imageSchema], // Define images as an array of objects
    address: {
        type: String,
        required: true
    },
  
    countryState: {
        type: String,
        required: true
    },
    countryCity: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    sizeinFt: {
        type: Number,
        required: true
    },
    heading: {
        type: String,
        required: true
    },
    rooms: {
        type: String,
        required: true
    },
    bedrooms: {
        type: String,
        required: true
    },
    bathrooms: {
        type: String,
        required: true
    },
    
    garages: {
        type: String,
        required: true
    },
    garageSize: {
        type: String,
        required: true
    },
    yearBuilt: {
        type: Number,
        required: true
    },
    availableFrom: {
        type: String,
        required: true
    },
    basement: {
        type: String,
        required: true
    },
    roofing: {
        type: String,
        required: true
    },
    exteriorMaterial: {
        type: String,
        required: true
    },
    date_added: {
        type: Date,
        default: Date.now()
    }

});

const Properties = mongoose.model('properties', pSchema);


module.exports = Properties

