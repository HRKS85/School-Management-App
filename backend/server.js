require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const StudentSchema = new mongoose.Schema({
  name: String, age: Number, rollNumber: String,
  address: String, city: String, state: String, pincode: String
});
const Student = mongoose.model('Student', StudentSchema);

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; 
    next(); 
  } catch (err) {
    res.status(400).json({ message: "Invalid Token." });
  }
};

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(400).json({ success: false, message: "Email already registered." });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ success: true, token, user: { name: user.name, email: user.email } });
});

app.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
  
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.json({ success: true, message: "Password updated successfully." });
});

app.get('/students', verifyToken, async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/students', verifyToken, async (req, res) => {
  const student = await Student.create(req.body);
  res.json(student);
});

app.put('/students/:id', verifyToken, async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(student);
});

app.delete('/students/:id', verifyToken, async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

module.exports = app;