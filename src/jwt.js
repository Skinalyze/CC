const jwtSecret = {
  secret: process.env.JWT_SECRET,
  options: {
    expiresIn: process.env.JWT_SECRET_EXPIRE
  }
};

module.exports = {jwtSecret};