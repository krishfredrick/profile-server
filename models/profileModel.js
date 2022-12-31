const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  lastname: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  email:{
    type:String,
    required: true,
  }
  ,
  phone:{
    type:String,
    require:true,
  },
  address:{
    type:String,
    require:true,

  },
  district:{
    type:String,
    require: true,
  },
  postalCode:{
    type:String,
    require: true,
  }




});

module.exports = mongoose.model("profile Form", profileSchema);
