import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res
      .status(201)
      .json({
        token,
        user: { id: user._id, name, email, balance: user.balance },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user._id, name: user.name, email, balance: user.balance },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CURRENT USER
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DEPOSIT
export const deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    user.balance += amount;
    await user.save();

    await Transaction.create({ user: user._id, type: "deposit", amount });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// WITHDRAW
export const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    if (user.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });
    user.balance -= amount;
    await user.save();

    await Transaction.create({ user: user._id, type: "withdraw", amount });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// TRANSFER
export const transfer = async (req, res) => {
  try {
    const { amount, toEmail } = req.body;
    const fromUser = await User.findById(req.user.id);
    const toUser = await User.findOne({ email: toEmail });

    if (!toUser)
      return res.status(404).json({ message: "Recipient not found" });
    if (fromUser.balance < amount)
      return res.status(400).json({ message: "Insufficient balance" });

    fromUser.balance -= amount;
    toUser.balance += amount;
    await fromUser.save();
    await toUser.save();

    await Transaction.create({
      user: fromUser._id,
      type: "transfer",
      amount,
      to: toUser._id,
    });
    res.json({ fromUser, toUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET TRANSACTIONS
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).populate(
      "to",
      "name email"
    );
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
