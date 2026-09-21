const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (user) => {
  const payload = { userId: user._id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const signup = async ({ name, email, phone, password }) => {
  try {
    // 1. Missing fields check
    if (!name || !name.trim()) throw new Error("Full name is required");
    if (!email || !email.trim()) throw new Error("Email address is required");
    if (!phone) throw new Error("Phone number is required");
    if (!password) throw new Error("Password is required");

    // 2. Format validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error("Invalid email format");
    
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(phone)) throw new Error("Phone number must contain 7-15 digits only");

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // 3. Database uniqueness checks
    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new Error("Email already in use");

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) throw new Error("Phone number already in use");

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, phone, passwordHash, role: "employee" });
    await user.save();

    // Return token + sanitised user (toJSON strips passwordHash)
    const token = signToken(user);
    return { token, user: user.toJSON() };
  } catch (error) {
    if (error.message.includes('buffering timed out')) {
      throw new Error('Database connection failed. Please try again later.');
    }
    throw error;
  }
};

const login = async ({ email, password }) => {
  try {
    if (!email || !email.trim()) throw new Error("Email address is required");
    if (!password) throw new Error("Password is required");

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = signToken(user);
    return { token, user: user.toJSON() };
  } catch (error) {
    if (error.message.includes('buffering timed out')) {
      throw new Error('Database connection failed. Please try again later.');
    }
    throw error;
  }
};

module.exports = { signup, login };
