const productModel = require("../Model/productModel");
const { uploadFile } = require("../aws/awscontroller");
var mongoose = require("mongoose");

const { isValid, isValidName, isvalidPrice, isValidAvailableSizes,isValidFile } = require("../validator/validator")

//-----------------------------------create api-----------------------------------------------------------------------
const createProduct = async function (req, res) {
  try {
    let data = req.body;
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, isDeleted, deletedAt } = data;
    let files = req.files;

    if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "plss put some data in body" })

    if (title || title == '') {
      if (!isValid(title)) return res.status(400).send({ status: false, message: "title is required!!" })
      const newtitle = await productModel.findOne({ title });
      if (newtitle) return res.status(400).send({ status: false, message: "title is already present" })
    }

    if (description || description == '') {
      if (!isValid(description)) return res.status(400).send({ status: false, message: "input valid description" })
    }
    if (!isValid(price)) return res.status(400).send({ status: false, message: "price is required!!" })

    if (!isvalidPrice(price)) return res.status(400).send({ status: false, message: "price is invalid" })

    if (currencyId || currencyId == '') {
      if (currencyId != "INR" || !isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is invalid" })
    }

    if (currencyFormat || currencyFormat == '') {
      if (currencyFormat != "₹" || !isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is invalid" })
    }

    if (isFreeShipping || isFreeShipping == '') {
      if (!(isFreeShipping == "true" || isFreeShipping == "false")) {
        return res.status(400).send({ status: false, message: "isFreeShipping should either be True or False." });
      }
    }

    if (style || style == '') {
      if (!isValidName(style)) return res.status(400).send({ status: false, message: "style is invalid" })
    }

    if (availableSizes || availableSizes == '') {
      availableSizes = availableSizes.split(",").map((x) => x.trim())
      data.availableSizes = availableSizes;
      if (!isValidAvailableSizes(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes is required or put valid sizes" })
    }

    if (installments || installments == '') {
      if (!isValid(installments) || !isvalidPrice(installments)) return res.status(400).send({ status: false, message: "installments must be valid or present" });
    }

    if (isDeleted || isDeleted == '') {
      if (!(isFreeShipping == "true" || isFreeShipping == "false")) return res.status(400).send({ status: false, message: "isDeleted is either true or false " });
    }

    if (deletedAt || deletedAt == '') {
      if (!isValid(deletedAt)) return res.status(400).send({ status: false, message: "isDeleted is not valid " });
    }

    if (files && files.length > 0) {
      if (!isValidFile(files[0].originalname))
      return res.status(400).send({ status: false, message: `Enter formate jpeg/jpg/png only.` })

      let uploadedFileURL = await uploadFile(files[0])
      data.productImage = uploadedFileURL
    }
    else {
      return res.status(400).send({ message: "No file found" })
    }

    let newproduct = await productModel.create(data);
    return res.status(201).send({ status: true, message: "Success", data: newproduct })

  } catch (err) {
    return res.status(500).send({ message: err.message })
  }
}

//-------------------------------------------get api-----------------------------------------------------------------------------------
const getbyquery = async function (req, res) {
  const { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query
  const filter = { isDeleted: false }
  if (size || size == '') {
    let newsize = size.split(",").map((x) => x.trim())
    if (!isValidAvailableSizes(newsize) || !isValid(newsize))
      return res.status(400).send({ status: false, message: "availableSizes is required or put valid sizes" });
    filter.availableSizes = newsize
  }
  if (name || name == '') {
    if (!isValid(name)) return res.status(400).send({ stastus: false, message: "Invalid naming format!" });
    const regex = new RegExp(name, 'g')
    filter.title = regex;
  }

  if (priceGreaterThan || priceGreaterThan == '') {
    if (!isvalidPrice(priceGreaterThan)) return res.status(400).send({ stastus: false, message: "Invalid pirceGreater format!" });
    filter.price = { $gt: priceGreaterThan }
  }
  if (priceLessThan || priceLessThan == '') {
    if (!isvalidPrice(priceLessThan)) return res.status(400).send({ stastus: false, message: "Invalid pirceLessThan format!" });
    filter.price = { $lt: priceLessThan }
  }
  if (priceGreaterThan && priceLessThan) {

    //error we have to told this in ta session
    if ((priceGreaterThan < priceLessThan) || (priceGreaterThan > priceLessThan)) {
      filter.price = { $gt: priceGreaterThan, $lt: priceLessThan }
    }
    else return res.status(400).send({ stastus: false, message: "priceGreaterThan is always less than the pricelessthan" });
  }


  if (priceSort || priceSort == '') {
    if (priceSort == 1) {
      const pro = await productModel.find(filter).sort({ price: 1 })
      if (!pro) { return res.status(400).send({ status: false, message: "No data found for ascending order" }) }
      return res.status(200).send({ status: true, message: 'Success', data: pro })
    }
    if (priceSort == -1) {
      const newpro = await productModel.find(filter).sort({ price: -1 });
      if (!newpro) { return res.status(400).send({ status: false, message: "No data found for descending order" }) }
      return res.status(200).send({ status: true,message: 'Success', data: newpro })
    }
    else return res.status(400).send({ status: false, message: "plss put a valid pricesort" })
  }
  const finaldata = await productModel.find(filter);
  if (!finaldata || finaldata.length == 0) { return res.status(200).send({ status: true, message: "No data found that matches your search or its already deleted" }) }

  return res.status(200).send({ status: true, message: 'Success', data: finaldata })
}

//-------------------------------------get by params api------------------------------------------------
const getbyparams = async function (req, res) {
  try {
    let productId = req.params.productId
    if (!mongoose.Types.ObjectId.isValid(productId)) { return res.status(400).send({ status: false, message: 'Please provide valid porductId for details' }) }

    const getdata = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!getdata )  return res.status(404).send({ status: false, message: "No data found from this Id or it is deleted" }) 

    return res.status(200).send({ status: true, message: 'Success', data: getdata })
  }
  catch (error) {
    return res.status(500).send({ message: error.message })
  }
}
 
//-------------------------------------delete api------------------------------------------------------------------------------
const deleteProductById = async function (req, res) {
  try {

    let productId = req.params.productId

    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "productId Must Be A Valid ObjectId" })

    let findProduct = await productModel.findById({ _id: productId })

    if (!findProduct || findProduct.isDeleted == true) {

      return res.status(400).send({ status: false, message: "Product does not exist or Already deleted" })
    }
    let deleteProduct = await productModel.findByIdAndUpdate(
      { _id: productId },
      { $set: { isDeleted: true, deletedAt: Date.now() } },
      { new: true }
    )

    return res.status(200).send({ status: true, message: "Successfully Deleted", data: deleteProduct })
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}

//-----------------------------------------------update api-----------------------------------------------------------------------
const updateProducts = async function (req, res) {
  try {
    let productId = req.params.productId
    let data = req.body
    data = JSON.parse(JSON.stringify(data))
    let files = req.files;
    //destructure of the req.body data :-
    let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, deletedAt } = data
    let product = {}
    let addtoSet = {}

    // req.body do not allow empty data :-
    if (Object.keys(data).length == 0 && !files)
      return res.status(400).send({ status: false, message: "please provide some data" })

    if (!mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "productId is should be valid" })

    // finding the data from params productId :-
    let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })

    if (!checkProduct) return res.status(404).send({ status: false, message: "product are not found or its already deleted" })
    

    if (data.hasOwnProperty("title")) {
      if (!isValid(title) || !isValidName(title)) return res.status(400).send({ status: false, message: "enter valid title" })
      let Title = await productModel.findOne({ title: title, isDeleted: false })
      if (Title) return res.status(400).send({ status: false, message: "given title already exit" })
      product.title = title
    }        // In req.body checking Title price and AvailableSizes unique or not :- 
    if (data.hasOwnProperty("description")) {
      if (!isValid(description)) return res.status(400).send({ status: false, message: "enter valid description" })
      product.description = description
    }
    if (data.hasOwnProperty("price")) {
      if (!isValid(price) || !isvalidPrice(price)) return res.status(400).send({ status: false, message: "enter valid price" })
      product.price = price
    }

    if (data.hasOwnProperty("currencyId")) {
      if (!isValid(currencyId) || currencyId != "INR") return res.status(400).send({ status: false, message: "enter valid currencyId" })
    }
    if (data.hasOwnProperty("currencyFormat")) {
      if (!isValid(currencyFormat) || currencyFormat != "₹") return res.status(400).send({ status: false, message: "enter valid currencyFormat" })
    }
    if (data.hasOwnProperty("isFreeShipping")) {
      if (!(isFreeShipping == "true" || isFreeShipping == "false")) return res.status(400).send({ status: false, message: "isFreeShipping is either true or false" })
      product.isFreeShipping = isFreeShipping
    }

    if (data.hasOwnProperty("style")) {
      if (!isValid(style) || !isValidName(style)) return res.status(400).send({ status: false, message: "style is invalid" })
      product.style = style
    }
    if (data.hasOwnProperty("availableSizes")) {
      availableSizes = availableSizes.split(",").map((x) => x.trim())
      if (!isValidAvailableSizes(availableSizes)) return res.status(400).send({ status: false, message: "availableSizes is required or put valid sizes" })
      addtoSet.availableSizes = { $each: availableSizes }
    }
    if (data.hasOwnProperty("installments")) {
      if (!isValid(installments) || !isvalidPrice(installments)) return res.status(400).send({ status: false, message: "installments must be valid" })
      product.installments = installments
    }
    if (data.hasOwnProperty("deletedAt")) {
      if (!isValid(deletedAt)) return res.status(400).send({ status: false, message: "deletedat must be valid" })
      product.deletedAt = deletedAt
    }

    if (files && files.length > 0) {
      if (!isValidFile(files[0].originalname))
            return res.status(400).send({ status: false, message: `Enter formate jpeg/jpg/png only.` })
      let uploadedFileURL = await uploadFile(files[0])
      product["productImage"] = uploadedFileURL;
    }
     else if (Object.keys(data).includes("productImage")) {
      return res.status(400).send({ status: false, message: "plss put the productImage" });
    }
    

    // update the product:-
    let updatedata = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false },
      { $set: product, $addToSet: addtoSet },
      { new: true });

    if (!updatedata) return res.status(400).send({ status: false, message: "no product prsent for updation with this id" })
    // In the reaponse we are send the updating product data :-
    return res.status(200).send({ status: true, message: "Successfully updated", data: updatedata })

  } catch (err) {
    res.status(500).send({ status: false, message: "Server Error", error: err.message })
  }
}
module.exports = { createProduct, getbyquery, getbyparams, deleteProductById, updateProducts };