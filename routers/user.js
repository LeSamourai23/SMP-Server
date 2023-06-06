import express from 'express';
import { login, logout, register, verify, addTicket, removeTicket, updateTicket, getMyProfile, updatePassword, updateProfile, forgetPassword, resetPassword } from '../controllers/user.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.route("/register").post(register);

router.route("/verify").post(isAuthenticated, verify);

router.route("/login").post(login);

router.route("/logout").get(logout)

router.route("/newTicket").post(isAuthenticated, addTicket);

router.route("/deleteTicket").delete(isAuthenticated, removeTicket);

router.route("/updateTicketStatus").post(isAuthenticated, updateTicket);

router.route("/me").get(isAuthenticated, getMyProfile);

router.route("/updateProfile").put(isAuthenticated, updateProfile);

router.route("/updatePassword").put(isAuthenticated, updatePassword);

router.route("/forgotPassword").post(isAuthenticated, forgetPassword);

router.route("/resetpassword").put(resetPassword);

export default router; 