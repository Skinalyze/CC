const express = require("express");
const register = express();
const bcrypt = require("bcryptjs");;
const dbPromise = require("./db");

const cors = require("cors");
register.use(cors());
register.use(express.json());

register.post('/register', async (req, res) => {
  const { nama, email, password, gender, age } = req.body;

  if (!nama || !email || !password || !gender || !age) {
      return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  try {
      const query_1 = "SELECT * FROM user WHERE `email` = ?";
      const [result] = await dbPromise.query(query_1, [email]);

      if (result.length > 0) {
          return res.status(409).json({ message: "Email sudah terdaftar." });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      let genderValue = gender.toLowerCase() === "laki-laki" ? 0 : 1;

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
