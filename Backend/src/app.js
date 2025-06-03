const express = require('express');
const passport = require('passport');
const session = require('express-session'); // เปลี่ยนที่นี่
const cors = require('cors');
require('dotenv').config();
require('./config/passport');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 วัน
    secure: false, // true ถ้าใช้ HTTPS
  }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', require('./routes/authRoutes'));

module.exports = app;
