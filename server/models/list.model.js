const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/* Creating a new schema for the list model. */
const listSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    // default: {
    //     type: Boolean,
    //     required: true,
    // },
    // owners: {
    //     type: Array,
    //     required: true,
    // }
});

module.exports = mongoose.model("List", listSchema);