const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
  

// Function to generate a random code
function generateCode() {
  return Math.random().toString(36).substr(2, 6); // Generate a 6-character alphanumeric code
}

// Function to send email
async function sendEmail(email, code) {
  // Create a nodemailer transporter
  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: '2021cs82@student.uet.edu.pk', // Your Gmail email address
          pass: '' // Your Gmail password
      }
  });
  //console.log(transporter );
  // Email content
  let mailOptions = {
      from: '2021cs82@student.uet.edu.pk',
      to: email,
      subject: 'Verification Code for Login',
      text: `Your verification code is: ${code}`
  };
  //console.log(mailOptions);
  // Send email
  await transporter.sendMail(mailOptions);
}
async function createUser(req, res) {
  console.log(req.body);
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.displayName,
      password: hashedPassword,
      email: req.body.email,
      role: req.body.role,
    });
    //console.log(user);
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(user);
}

async function updateUser(req, res) {
  user = await User.findById(req.params.id);
  console.log(res);
  if (req.body.username != null) {
    user.username = req.body.username;
  }
  if (req.body.password != null) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }
  if (req.body.firstName != null) {
    user.firstName = req.body.firstName;
  }
  if (req.body.lastName != null) {
    user.lastName = req.body.lastName;
  }
  if (req.body.dob != null) {
    user.dob = req.body.dob;
  }
  if (req.body.role != null) {
    user.role = req.body.role;
  }
  try {
    user.save();
    const updatedUser = user;
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    console.log(req.params.id);
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}
const jwt = require("jsonwebtoken"); // Import the jwt library

function generteLoginToken(user) {
  const payload = {
    role: user.role,

    id: user._id,
  };
  const token = jwt.sign(payload, "adsfasdfjkh$#asdfasdf.adsfxc");
  return token;
}
async function loginUser(req, res) {
  const { email, password } = req.body;
  console.log({ email, password });

  try {
      const user = await User.findOne({ email });
      // console.log(user);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!(await bcrypt.compare(password, user.password))) {
          return res.status(400).json({ error: "Invalid credentials" });
      }
      //console.log('login');
      // Generate verification code
      const verificationCode = generateCode();
      //console.log(verificationCode);
      // Save verification code to user document
      user.verificationCode = verificationCode;
      await user.save();
      
      // Send verification code via email
      await sendEmail(email, verificationCode);
      //console.log('login2')
      return res.status(200).json({
          message: "Verification code sent successfully",
          email: email,
          fullname: user.fullname,
          userid: user._id,
      });
  } catch (err) {
      return res.status(500).json({ message: err });
  }
}

async function verifyCode(req, res) {
  console.log('verifyCode');
  const { email, code } = req.body;

  try {
      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ error: "User not found" });
      console.log(user);
      if (user.verificationCode !== code) {
          return res.status(400).json({ error: "Invalid verification code" });
      }

      // Clear verification code after successful verification
      user.verificationCode = null;
      await user.save();

      // Generate JWT token for user
      const token = jwt.sign({ email: user.email, id: user._id }, process.env.ACCESS_TOKEN_SECRET);

      return res.status(200).json({
          message: "Logged in successfully",
          email: email,
          fullname: user.fullname,
          userid: user._id,
          token: token,
          role: user.role,
      });
  } catch (err) {
      return res.status(500).json({ message: err });
  }
}
async function adminDashboard(req, res) {
  return res.status(200).json({ message: "Welcome to admin dashboard" });
}

function requireRoles(roles) {
  return (req, res, next) => {
    console.log(req);
    const userRole = req.user.role; // Assuming you saved the user's role in req.user
    console.log(userRole);
    if (roles.includes(userRole)) {
      // User has one of the required roles, so allow access

      next();
    } else {
      // User does not have any of the required roles, so send a forbidden response

      res.status(403).json({ message: "Permission denied" });
    }
  };
}

async function sharedRoles(req, res) {
  const role = req.user.role;
  return res.json({ message: `Welcome ${role}` });
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  adminDashboard,
  requireRoles,
  sharedRoles,
  verifyCode,
};
