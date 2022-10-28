const aws= require("aws-sdk")

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); 

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket", 
        Key: "abc/" + file.originalname, 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err.message})
        }
        return resolve(data.Location)
    })
   })
}

module.exports.uploadFile=uploadFile;