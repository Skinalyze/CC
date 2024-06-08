const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require('./jwt');
const login = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root", // sesuaikan dengan username database Anda
  password: "", // sesuaikan dengan password database Anda
  database: "skinalyze", // sesuaikan dengan nama database Anda
});


db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database.");
});

const dbPromise = db.promise();

// Login [POST]
login.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
      return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  try {
      // Periksa apakah email ada di database
      const sql = "SELECT * FROM user WHERE `email` = ?";
      const [result] = await dbPromise.query(sql, [email]);

      if (result.length === 0) {
          return res.status(401).json({ message: "Invalid email." });
      }

      // Periksa password
      const user = result[0];
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
          return res.status(401).json({ message: "Invalid password." });
      }

      // Buat token
      const token = jwt.sign({ id_user: user.id_user }, jwtSecret.secret, jwtSecret.options);

      return res.status(200).json({ message: "Login successfully.", token: token, email: user.email });
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = login;
