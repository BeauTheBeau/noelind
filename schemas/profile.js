const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userID: {type: String, required: true, unique: true},
    xp: {type: Number, default: 0},
    level: {type: Number, default: 0},
    characters: {type: Object, default: {active: null,}},
    inventory: {type: Object, default: {}},
    combat: {type: Object, default: {active: false, combatID: null}},
});

const model = mongoose.model('ProfileModels', profileSchema);
module.exports = model;