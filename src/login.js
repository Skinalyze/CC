const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt"); // Jangan lupa untuk mengimpor bcrypt
const jwt = require("jsonwebtoken"); // Tambahkan ini untuk JWT
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

login.post("/login", (req, res) => {
  const { email, password } = req.query;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  // Periksa apakah email ada di database
  const sql = "SELECT * FROM user WHERE `email` = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email." });
    }

    // Periksa password
    const user = result[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }
    const token = jwt.sign({ id_user: user.id_user }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      message: "Login successfully.",
      token: token,
      email: user.email,
    });
  });
});

module.exports = login;
