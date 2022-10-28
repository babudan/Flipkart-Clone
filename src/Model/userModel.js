const mongoose = require("mongoose")

const userModel = new mongoose.Schema({

    fname: {type: String,required: true,trim: true},
    lname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profileImage: { type: String, required: true }, // s3 link
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true}, // encrypted password
    address: {
        shipping: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            pincode: { type: Number, required: true }
        },

        billing: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            pincode: { type: Number, required: true }
        }
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("user",userModel)