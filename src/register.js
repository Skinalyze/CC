const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt"); // Jangan lupa untuk mengimpor bcrypt
const register = express();

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

register.post("/register", (req, res) => {
  const { nama, email, password, gender, age } = req.query;

  // Validasi input
  if (!nama || !email || !password || !gender || !age) {
    return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  // Validasi email
  const query_1 = "SELECT * FROM user WHERE `email` = ?";
  db.query(query_1, [email], (err, result) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    // Enkripsi password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Ubah tipe data gender
    let genderValue = gender.toLowerCase() === "laki-laki" ? 0 : 1;

    // Memasukan data ke tabel user
    const query_2 =
      "INSERT INTO user (`nama`, `email`, `password`, `gender`, `age`) VALUES (?, ?, ?, ?, ?)";
    const values = [nama, email, hashedPassword, genderValue, age];
    db.query(query_2, values, (err) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      return res.status(201).json({ message: "User berhasil dibuat." });
    });
  });
});
module.exports = register;
