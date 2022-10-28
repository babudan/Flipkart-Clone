const express = require('express')

const router = express.Router()

const {createuser,userLogin, getuser, updateuser} = require("../Controller/userController")

const {createProduct, getbyquery, getbyparams, deleteProductById, updateProducts} = require("../Controller/productController");

const {createCart,getCart,DeleteCart,updateCart} = require("../Controller/cartController");

const {createOrder ,updateOrder} = require("../Controller/orderController");

const {authentication,authorisation} = require("../auth/authentication");

//------------------------------------------user router-----------------------------------------------------------------

router.post("/register",createuser)

router.post("/login",userLogin)

router.get("/user/:userId/profile" ,authentication,authorisation, getuser)

router.put("/user/:userId/profile" ,authentication,authorisation, updateuser)

//------------------------------product routes-----------------------------------------------------------------------------

router.post("/products" ,createProduct)

router.get("/products" ,getbyquery)

router.get("/products/:productId" ,getbyparams);

router.delete("/products/:productId" ,deleteProductById)

router.put("/products/:productId" ,updateProducts)

//----------------------------------cart routes-----------------------------------------------------------------------------------

router.post("/users/:userId/cart" , createCart)

router.get("/users/:userId/cart" ,authentication,authorisation, getCart);

router.delete("/users/:userId/cart",authentication,authorisation, DeleteCart);

router.put("/users/:userId/cart", updateCart)

//------------------------------------order routes----------------------------------------------------------------------------------

router.post("/users/:userId/orders" ,authentication,authorisation,createOrder )

router.put("/users/:userId/orders" ,authentication,authorisation,updateOrder)

module.exports=router