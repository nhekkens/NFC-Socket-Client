const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define ndaUserSchema
const cardUserSchema = new Schema({
    id: String,
    name: { type: String, unique: false, required: false },
    country: { type: String, unique: false, required: false },
    company: { type: String, unique: false, required: false },
    title: { type: String, unique: false, required: false },
    email: { type: String, unique: false, required: false },
    companyNumber: { type: String, unique: false, required: false },
    companyAddress: { type: String, unique: false, required: false },
    companyColor1: { type: Number, unique: false, required: false },
    companyColor2: { type: Number, unique: false, required: false },
    companyColor3: { type: Number, unique: false, required: false }
});

const cardUser = mongoose.model('cardUser', cardUserSchema);

module.exports = cardUser;
