import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const TicketSchema = new mongoose.Schema({
  
  "ticket_no": String,
  "created_on": String,
  "ticket_status": String,
  "CriticalityNumber": String,
  "assign_to_level": Number,
  "open": String,
  "technicians": Array,
  
  "customer": {
    "first_name": String,
    "last_name": String,
    "middle_name": String,
    "Mobile_No": String,
    "Email_id": String,
    "state": String,
    "district": String,
    "tehsil": String,
  },
  
  "machine": {
    "MACHINENO": String,
    "PRODUCT": String,
    "MODEL_NAME": String,
    "SERIES": String,
    "STATE": String,
    "DISTRICT": String,
    "TEHSIL": String,
    "village": String,
  },

  "assign_to_dealer": {
    "DealerCode": String,
  },
  
  "remarks": String,
  "serviceType": {
    "service_type": String,
    "service_type_no": String
  }
}
);

const EmployeeSchema = new mongoose.Schema({
  
  "EmpCode": String,
  "FirstName": String,
  "MiddleName": String,
  "LastName": String,
  "NickName": String,
  "MobileNumber":String,
  "emp_designation_Id": Number,
  "emp_department_Id": Number,
  "branch": String,
  "designation":String,
  "CreatedBy": String,
  "CreatedDate": String,
  "ModifiedBy": String,
  "ModifiedDate": String,

});

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters long"],
    select: false
  },

  profile: {
    public_id: String,
    url: String
  },

  verified: {
    type: Boolean,
    default: false
  },

  otp: Number,
  otp_expiry: Date,
  resetPasswordOtp: Number,
  resetPasswordOtp: Date,

  feedback: {
    message: String,
    rating: Number
  },

  report: String,

  findAllEmployees: [EmployeeSchema], // Manpower schema as a sub-document
  getTicket: [TicketSchema] // Ticket schema as a sub-document
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next();
})

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  })
}

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 })

export const User = mongoose.model('User', userSchema)
export const Ticket = mongoose.model('Tickets', TicketSchema)
export const Employee = mongoose.model('Employee', EmployeeSchema)