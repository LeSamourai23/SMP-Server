import { User, Ticket, Employee } from "../models/Schema.js"
import { sendToken } from "../utils/sendToken.js"
import { sendMail } from "../utils/sendMail.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //const profile = req.files.profile.tempFilePath;

    let user = await User.findOne({ email })

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists" })
    }

    // myCloud= await cloudinary.v2.uploader.upload(profile, {folder: "SMP"})

    //fs.rmSync("./tmp", { recursive: true})

    const otp = Math.floor(Math.random() * 1000000)

    user = await User.create({
      name,
      email,
      password,
      /*             profile:{
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                  }, */
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000)
    })

    await sendMail(email, "Verify your account", `Your OTP is ${otp}`)

    sendToken(res, user, 201, "An E-Mail with an OTP has been sent to your address, please verify your account");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);

    const user = await User.findById(req.user._id);

    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or has been Expired" });
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendToken(res, user, 200, "Account Verified");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email" })
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" })
    }

    sendToken(res, user, 201, "Login Successful");

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const logout = async (req, res) => {
  try {

    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now())
      })
      .json({ success: true, message: "Logged Out Successfully" })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const addTicket = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const {
      ticket_no,
      created_on,
      ticket_status,
      CriticalityNumber,
      assign_to_level,
      open,
      technicians,
      first_name,
      last_name,
      middle_name,
      Mobile_No,
      Email_id,
      state,
      district,
      tehsil,
      MACHINENO,
      PRODUCT,
      MODEL_NAME,
      SERIES,
      STATE,
      DISTRICT,
      TEHSIL,
      village,
      DealerCode,
      remarks,
      service_type,
      service_type_no
    } = req.body;

    const getTicket = new Ticket({

      ticket_no,
      created_on,
      ticket_status,
      CriticalityNumber,
      assign_to_level,
      technicians,
      open,

      customer: {
        first_name,
        last_name,
        middle_name,
        Mobile_No,
        Email_id,
        state,
        district,
        tehsil,
      },

      machine: {
        MACHINENO,
        PRODUCT,
        MODEL_NAME,
        SERIES,
        STATE,
        DISTRICT,
        TEHSIL,
        village,
      },

      assign_to_dealer: {
        DealerCode,
      },

      remarks,

      serviceType: {
        service_type,
        service_type_no
      }
    });

    user.getTicket.push(getTicket);

    await user.save();

    res.status(200).json({ success: true, message: 'Ticket added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const removeTicket = async (req, res) => {
  try {
    const ticketNo = req.body.ticketNo;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const ticketIndex = user.getTicket.findIndex(ticket => ticket.ticket_no === ticketNo);

    if (ticketIndex === -1) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    user.getTicket.splice(ticketIndex, 1);

    await user.save();

    res.status(200).json({ success: true, message: 'Ticket removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* export const updateTicket = async (req, res) => {
  try {
    const { ticketNumber, step } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const ticket = user.tickets.find(ticket => ticket.ticket.ticketNumber === ticketNumber);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    switch (step) {
      case 1:
        ticket.currentStatus.status = 'Allocated';
        break;
      case 2:
        ticket.currentStatus.status = 'Converted to Workorder';
        break;
      case 3:
        ticket.currentStatus.status = 'Escalated';
        break;
      case 4:
        ticket.currentStatus.status = 'Completed';
        ticket.currentStatus.Open = 'Closed';
        break;
      default:
        return res.status(400).json({ error: 'Invalid step' });
    }

    await user.save();

    res.status(200).json({ success: true, message: 'Ticket status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; */

export const sendFeedback = async (req, res) => {
  const feedbackData = req.body.feedbackData;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const feedbackData = {
      message,
      rating
    }

    user.feedback.push(feedbackData);

    await user.save();

    return res.status(200).json({ message: 'Feedback added successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const reportBug = async (req, res) => {
  const { userId, reportData } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.report.push(reportData);

    await user.save();

    return res.status(200).json({ message: 'Report added successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const addManpower = async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const {
      EmpCode,
      FirstName,
      MiddleName,
      LastName,
      designation,
      NickName,
      branch,
      MobileNumber
    } = req.body;

    const newEmployee = new Employee({
      EmpCode,
      FirstName,
      MiddleName,
      LastName,
      NickName,
      branch,
      designation,
      MobileNumber
    });

    user.findAllEmployees.push(newEmployee);

    await user.save();

    res.status(200).json({ success: true, message: "Worker added successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeManpower = async (req, res) => {
  try {
    const ECode = req.body.ECode;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const employeeIndex = user.findAllEmployees.findIndex(employee => employee.EmpCode === ECode);

    if (employeeIndex === -1) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    user.findAllEmployees.splice(employeeIndex, 1);

    await user.save();

    res.status(200).json({ success: true, message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    sendToken(res, user, 201, `Welcome back ${user.name}`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name } = req.body;
    const profile = req.files.profile.tempFilePath;

    if (name) user.name = name;
    if (profile) {
      await cloudinary.v2.uploader.destroy(user.profile.public_id);

      const mycloud = await cloudinary.v2.uploader.upload(profile);

      fs.rmSync("./tmp", { recursive: true });

      user.profile = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url,
      };
    }

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profile Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter all fields" });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Old Password" });
    }

    user.password = newPassword;

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    const otp = Math.floor(Math.random() * 1000000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    const message = `Your OTP for reseting the password ${otp}. If you did not request for this, please ignore this email.`;

    await sendMail(email, "Request for Reseting Password", message);

    res.status(200).json({ success: true, message: `OTP sent to ${email}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordOtp: otp,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Otp Invalid or has been Expired" });
    }
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: `Password Changed Successfully` });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};






