//Connect to Mongo database
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const uri = `mongodb://127.0.0.1:27017/NFC`;

mongoose.connect(uri).then(
    () => {
        console.log('NFC - Connected to Mongo NFC');
    },
    err => {
        console.log('error connecting to Mongo: ');
        console.log(err);
    }
);

module.exports = mongoose.connection;
