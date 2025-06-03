const db = require('../utils/db'); // เช่พอยู่ดึง mysql2

const createUserIfNotExists = async (profile) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id_google = ?', [profile.id]);
  if (rows.length === 0) {
    await db.query(
      'INSERT INTO users (id_google, username, gmail, photo) VALUES (?, ?, ?, ?)',
      [
        profile.id,
        profile.displayName,
        profile.emails[0].value,
        profile.photos[0].value
      ]
    );

  }
  return profile;
};

module.exports = { createUserIfNotExists };
