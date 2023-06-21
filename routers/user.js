import express from 'express';
import { 
    login, 
    logout, 
    register, 
    verify, 
    addTicket, 
    removeTicket, 
    getMyProfile, 
    updatePassword, 
    updateProfile, 
    forgetPassword, 
    resetPassword, 
    addManpower,
    sendFeedback,
    reportBug, 
    removeManpower} from '../controllers/user.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.route("/register").post(register);

router.route("/verify").post(isAuthenticated, verify);

router.route("/login").post(login);

router.route("/logout").get(logout)

router.route("/newTicket").post(isAuthenticated, addTicket);

router.route("/addManpower").post(isAuthenticated, addManpower);

router.route("/deleteTicket").delete(isAuthenticated, removeTicket);

router.route("/deleteManpower").delete(isAuthenticated, removeManpower);

//router.route("/updateTicketStatus").post(isAuthenticated, updateTicket);

router.route("/me").get(isAuthenticated, getMyProfile);

router.route("/updateProfile").put(isAuthenticated, updateProfile);

router.route("/updatePassword").put(isAuthenticated, updatePassword);

router.route("/forgotPassword").post(forgetPassword);

router.route("/resetpassword").put(resetPassword);

router.route("/sendFeedback").post(isAuthenticated, sendFeedback)

router.route("/reportBug").post(isAuthenticated, reportBug)

export default router; 