import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const ticketSchema = new mongoose.Schema({

    ticket: {
      ticketNumber: String,
      createdDate: Date,
      dealerCode: Number,
      criticality: String,
      assignedTechnician: String
    },

    customer: {
      name: String,
      mobileNumber: String,
      customerType: String,
      state: String,
      district: String,
      tehsil: String,
      village: String
    },
    
    machine: {
      machineNumber: String,
      product: String,
      machineModel: String,
      series: String,
    },
    
    remarks: {
      remark: String,
      serviceType: String,
      customerConcerns: String
    },
    
    currentStatus: {
      status: String,
      deliveryDate: Date,
      Open: String
    }
  });
  
const manpowerSchema = new mongoose.Schema({
    name: String,
    post: String,
    phoneNumber: String,
    employeeID: String,
    photo: String
  });

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required: true
    }, 

    email: {
        type:String,
        required: true,
        unique: true
    },

    password:{
        type: String,
        required: true,
        minlength: [8, "Password must be at least 8 characters long"],
        select: false
    },

    profile: {
        public_id: String,
        url: String
    },

    verified:{
      type: Boolean,
      default: false
    },

    otp: Number,
    otp_expiry: Date,
    resetPasswordOtp: Number,
    resetPasswordOtp: Date,

    manpower: [manpowerSchema], // Manpower schema as a sub-document
    tickets: [ticketSchema] // Ticket schema as a sub-document
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next();
})

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id:this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  })
}

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.index({otp_expiry: 1}, {expireAfterSeconds: 0})
  
export const User = mongoose.model('User', userSchema)
export const Tickets = mongoose.model('Tickets', ticketSchema)
