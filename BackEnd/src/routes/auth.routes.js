const express = require("express");
const router = express.Router();

const {
    register,
    verifyOtp,
    resendOtp,
    login,
    logout,
    checkAuth
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, checkAuth);

module.exports = router;