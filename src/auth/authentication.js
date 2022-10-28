const jwt = require("jsonwebtoken")
const userModel = require("../Model/userModel")
var mongoose = require("mongoose");

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["authorization"];

        if (!token) return res.status(400).send({ status: false, msg: "token is required" })

       token = token.split(" ")
        jwt.verify(token[1],process.env.SECRET_TOKEN, (error, decodedtoken) => {
           
        if (error)  return res.status(401).send({ status: false, message: "token is invalid or expired" });

        req["decodedtoken"]=decodedtoken;
        next()
    })
    }
    catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}

const authorisation = async function (req, res, next) {
    try {
        let updateuserId = req.params.userId
            
        if (!mongoose.Types.ObjectId.isValid(updateuserId)) { return res.status(400).send({ status: false, message: 'Please provide valid UserId for details' }) }
  
            let updatinguserId = await userModel.findById({ _id: updateuserId })
            if(!updatinguserId){ return res.status(404).send({status:false,msg:"No user details found with this id"})}
            let userId = updatinguserId._id
            let id = req.decodedtoken._id;
            if (id != userId) return res.status(403).send({ status: false, msg: "You are not authorised to perform this task" })
       
        next();
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ msg: error.message })
    }
}

module.exports = { authentication , authorisation }