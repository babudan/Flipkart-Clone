const isValidPassword = function (password) {
    if(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(password)) return true;
    return false;
  };
  
  const isValidName = function (string) {
      let regex = /^[a-zA-Z\\s]{2,20}$/;
      if (regex.test(string)) {
          return true;
      }
      return false;
  };

  const isValidadress = function (name) {
    if (/^[a-z ,.'-]+$/i.test(name)) return true;
    return false;
  };
  const isValidWords = function (name) {
    if (/^[a-z0-9 ,.#@*&%$-]+$/i.test(name)) return true;
    return false;
  };
  
  const isValidNumber = function (number) {
    if (/^[0]?[6789]\d{9}$/.test(number)) return true;
    return false;
  };
  
  const isValidPincode =function (pincode) {
    if(/^[1-9][0-9]{5}$/.test(pincode)) return true ;
    return false;
  };
  
  const isValidEmail = function (mail) {
    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(mail)) return true;
      return false;
  };
const isValid = function (value) {
    if (typeof value === undefined || value == null || value.length == 0) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };

  const isvalidPrice = function(Price) {
    if( /^[1-9]\d{0,8}(?:\.\d{1,2})?$/.test(Price)) return true;
    return false;
  }

  const isValidAvailableSizes = (availablesizes) => {
    for( i=0 ;i<availablesizes.length; i++){
      if(!["S", "XS","M","X", "L","XXL", "XL"].includes(availablesizes[i]))return false
    }
    return true
};
 
const isvalidStatus = (status) => {
      if(!["pending", "completed", "cancled"].includes(status)) return false;
      return true;
};
const isValidFile = (img) => {
  const regex = /(\/*\.(?:png|gif|webp|jpeg|jpg))/.test(img)
  return regex
}

module.exports = { isValidName, isValidNumber, isValidPincode, isValidEmail, isValid ,isValidPassword, isvalidPrice,isValidAvailableSizes, isValidWords,isValidFile,isvalidStatus,isValidadress }