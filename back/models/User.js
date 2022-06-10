const mongoose = require('mongoose');
const MongooseUniqueValidator = require('mongoose-unique-validator');
const MongooseErrors = require('mongoose-errors');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true ,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.plugin(MongooseUniqueValidator);
UserSchema.plugin(MongooseErrors);

module.exports = mongoose.model('Users', UserSchema);