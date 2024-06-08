const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const register = express();
const dbPromise = require("./db");

// Register [POST]
register.post('/register', async (req, res) => {
  const { nama, email, password, gender, age } = req.body;

  // Validasi input
  if (!nama || !email || !password || !gender || !age) {
      return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  try {
      // Validasi email
      const query_1 = "SELECT * FROM user WHERE `email` = ?";
      const [result] = await dbPromise.query(query_1, [email]);

      if (result.length > 0) {
          return res.status(409).json({ message: "Email sudah terdaftar." });
      }

      // Enkripsi password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Ubah tipe data gender
      let genderValue = (gender.toLowerCase() === 'laki-laki') ? 0 : 1;

      // Memasukan data ke tabel user
      const query_2 = "INSERT INTO user (`nama`, `email`, `password`, `gender`, `age`) VALUES (?, ?, ?, ?, ?)";
      const values = [nama, email, hashedPassword, genderValue, age];
      await dbPromise.query(query_2, values);

      return res.status(201).json({ message: "User berhasil dibuat." });
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = register;
