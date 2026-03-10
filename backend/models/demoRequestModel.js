const mongoose = require('mongoose');

const demoRequestSchema = new mongoose.Schema({
  yourName: { 
    type: String, 
    required: true 
  },
  emailAddress: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('DemoRequest', demoRequestSchema);