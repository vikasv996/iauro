let config = require('./configs');
let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

module.exports = async function () {
    try {
        let db = await mongoose.connect(config.db);
        console.log('MongoDB connected')
        // mongoose.set('debug', true);
    } catch (err) {
        console.log('Error while connecting to database --- ', err);
    }
};
