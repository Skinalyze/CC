const express = require("express");
const mysql = require("mysql");
const update = express();

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

update.put("/skintype", (req, res) => {
  const { id_user, skintypes, sensitif } = req.query;

  // Validasi input
  if (!id_user || !skintypes || !sensitif) {
    return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  // Melakukan update data ke tabel user
  const sql =
    "UPDATE user SET `skintypes` = ?, `sensitif` = ? WHERE `id_user` = ?";
  const values = [skintypes, sensitif, id_user];
  db.query(sql, values, (err) => {
    if (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    return res.status(201).json({ message: "Skin type updated successfully." });
  });
});

module.exports = update;
