const mongoose = require(`mongoose`);

const aSchema = new mongoose.Schema({

    agentName: {
        type: String,
        required: true
    },  
    agentEmail: {
        type: String,
        required: true
    },
    agentNumber: {
        type: String,
        required: true
    },
    agentPosition:{
        type: String,
        required: true
    },
    agentAddress:{
        type: String,
        required: true
    },
    emergencyName:{
        type: String,
        required: true
    },
    emergencyNumber:{
        type: String,
        required: true
    },
    employDate:{
        type: String,
        required: true
    },
    agentBio:{
        type:String,
        required:true
    },
    image:{
        data: Buffer,
        contentType: String
    },
    date_added: {
        type: Date,
        default: Date.now()
    }
});

const Agent = mongoose.model('ourAgents', aSchema);


module.exports = Agent

