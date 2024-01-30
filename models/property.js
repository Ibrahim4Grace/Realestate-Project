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
    propertyStatus: {
        type: String,
        required: true
    },
    agentNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    heading: {
        type: String,
        required: true
    },
    sizeinFt: {
        type: Number,
        required: true
    },
    bedrooms: {
        type: String,
    },
    bathrooms: {
        type: String,
    },
    garages: {
        type: String,
    },
    pool: {
        type: String,
    },
    yearBuilt: {
        type: Number,
    },
    availableFrom: {
        type: String,
        required: true
    },
    images: [imageSchema], // Define images as an array of objects
    description: {
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

