const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    title: String,
    description: String,
    images: [String], 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    user_id : {type: String},
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
