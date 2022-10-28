const mongoose = require("mongoose")

const productModel = new mongoose.Schema({
    title: {type:String, required:true, unique:true},
    description: {type:String,reuired:true },
    price: {type:Number, required:true},
    currencyId: {type:String, required:true, default:"INR"},
    currencyFormat: {type:String,required:true, default:"₹" },
    isFreeShipping: {type:Boolean, default: false},
    productImage: {type:String, required:true},  // s3 link
    style: {type:String},
    availableSizes: {type: [String], trim: true, required: true},
    installments: {type:Number},
    deletedAt: {type:Date , default:null}, 
    isDeleted: {type:Boolean, default: false}

},{timestamps:true})

module.exports = mongoose.model('product',productModel)