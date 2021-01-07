const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    name: String
});

module.exports = model('User', UserSchema);
