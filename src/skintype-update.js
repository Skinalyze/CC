const express = require("express");
const mysql = require("mysql2");
const update = express();
const verifyToken = require("./functionToken");

const dbPromise = require("./db");

// Update Skin Type User [PUT]
update.put('/skintype', verifyToken, async (req, res) => {
  const { skintypes, sensitif } = req.body;

  const userId = req.user.id_user;

  if (!userId) {
      return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
  }

  // Validasi input
  if (!skintypes || !sensitif) {
      return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  try {
      // Melakukan update data ke tabel user
      const sql = "UPDATE user SET `skintypes` = ?, `sensitif` = ? WHERE `id_user` = ?";
      const values = [skintypes, sensitif, userId];
      await dbPromise.query(sql, values);

      return res.status(200).json({ message: "Skin type updated successfully." });
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = update;
