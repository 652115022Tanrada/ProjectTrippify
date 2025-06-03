const userService = require('../services/userService');

exports.googleCallback = async (req, res) => {
  // req.user ได้มาจาก passport
  try {
    const userData = req.user;
    await userService.findOrCreate(userData); // -> เพิ่ม DB
    res.redirect(process.env.CLIENT_URL);
  } catch (err) {
    res.redirect('/auth/failure');
  }
};

exports.getUser = (req, res) => {
  if (req.user) res.json(req.user);
  else res.status(401).json({ message: 'Not Authenticated' });
};

exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out' });
    });
  });
};
exports.googleCallback = async (req, res) => {
  try {
    const userData = req.user;
    console.log('✅ Google User:', userData); // ⬅️ ตรวจค่าที่ได้
    await userService.findOrCreate(userData);
    res.redirect(process.env.CLIENT_URL);
  } catch (err) {
    console.error('🔥 Error during user save:', err); // ⬅️ ดู log error
    res.redirect('/auth/failure');
  }
};


