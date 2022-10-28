const productModel = require("../Model/productModel")
const cartModel = require("../Model/cartModel")
const orderModel = require("../Model/orderModel")
const { mongo, default: mongoose } = require("mongoose")
const { isValid,isvalidStatus } = require("../validator/validator")
const userModel = require("../Model/userModel")

const createOrder  = async function(req,res){
    let cartId = req.body.cartId;
    let cancellable = req.body.cancellable;

    if(Object.keys(req.body).length == 0) return res.status(400).send({status:false ,message:"plss put some data in body"});

    if(!mongoose.Types.ObjectId.isValid(cartId) || !isValid(cartId)) return res.status(400).send({status:false ,message:`plss put valid ${cartId}`});

    let userId = req.params.userId
    if(!mongoose.Types.ObjectId.isValid(userId) || !isValid(userId)) return res.status(400).send({status:false ,message:`plss put valid ${userId}`});

    let userCart = await cartModel.findOne({_id:cartId})
    let array = userCart.items
    let totalQuantity = 0
    for(let i=0;i<array.length;i++){
        totalQuantity+=array[i].quantity 
    }

    if(cancellable || cancellable == '') {
        if(!(cancellable == "true" || cancellable == "false")) return res.status(400).send({status:false, message:"cabcellable must be true or false"})
    }
    let obj ={
      userId:userCart.userId,
    items:userCart.items,
    totalPrice:userCart.totalPrice,
    totalItems:userCart.totalItems,
    totalQuantity:totalQuantity,
    cancellable:cancellable
}
let orderCreate = await orderModel.create(obj)

let cart ={totalItems:0,totalPrice:0,items:[]}
const finaldata = await cartModel.findOneAndUpdate({_id:cartId},cart,{new:true})
    

return res.status(201).send({status:true, message:"Success",data:orderCreate})
}



const updateOrder = async function (req, res) {
    try {
      let userId = req.params.userId;
      let data = req.body;
      let { status, orderId } = data;
  
      if (!isValid(userId) || !mongoose.Types.ObjectId.isValid(userId))
        return res.status(400).send({ status: false, message: "Invalid userId" });

      let userDetails = await userModel.findOne({_id: userId,isDeleted: false});
      if(!userDetails)   return res.status(400).send({status: false,message: "user is not present"});
  
      if (!isValid(orderId) || !mongoose.Types.ObjectId.isValid(orderId))
        return res.status(400).send({ status: false, message: "Invalid orderId or order id must be present" });
  
      let orderDetails = await orderModel.findOne({_id: orderId,isDeleted: false});
      if(!orderDetails)   return res.status(400).send({status: false,message: "order is not present"});
  
      if (!isvalidStatus(status)) {
        return res.status(400).send({status: false,message: "status should be from [pending, completed, cancelled]"});
      }

    if(orderDetails.cancellable == true) {
      if (orderDetails.status === "completed") {
       if(status) return res.status(400).send({status: false,message: "Order completed, now its status can not be updated"});
      }
  
      if ( orderDetails.status == "cancelled") {
        if(status) return res.status(400).send({ status: false, message: "Order is not cancellable" });
      } 
        if (orderDetails.status === "pending") {
          if(status) {
          if (!isvalidStatus(status)) return res.status(400).send({status: false,message: "status should be from [pending, completed, cancelled]"});   
          }
        let orderStatus = await orderModel.findOneAndUpdate({ _id: orderId },{ $set: { status: status } },{ new: true });
        return res.status(200).send({status: true,message: "Success",data: orderStatus});
        }
      }

    if (orderDetails.status === "completed") {
      if(status) return res.status(400).send({status: false,message: "Order completed, now its status can not be updated"});
    }

    if ( orderDetails.status == "cancelled") {
      if(status) return res.status(400).send({ status: false, message: "Order is not cancellable" });
    } 
    if (orderDetails.status === "pending") {
      if(status) {
      if (!["completed" , "pending"].indexOf(status) === -1) return res.status(400).send({status: false,message: "status should be from [ completed,pending]"});   
      } 
    let orderStatus = await orderModel.findOneAndUpdate({ _id: orderId },{ $set: { status: status } },{ new: true });
    return res.status(200).send({status: true,message: "Success",data: orderStatus});
    }
       
    } catch (error) {
      res.status(500).send({ status: false, error: error.message });
    }
  };

module.exports = {createOrder ,updateOrder}