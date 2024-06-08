const express = require("express");
const mysql = require("mysql2");
const hapus = express();
const verifyToken = require("./functionToken");

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

// Delete History Details
hapus.delete('/deleteRecommendation', verifyToken, async (req, res) =>{
  const { id_rekomendasi } = req.body;

  const userId = req.user.id_user;

  if (!userId) {
      return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
  }

  if (!id_rekomendasi) {
    return res.status(400).json({ message: "Tidak ada rekomendasi" });
  }

  try {
      const query_1 = "DELETE FROM rekomendasi WHERE `id_rekomendasi` = ? ";
      await dbPromise.query(query_1, id_rekomendasi);

      return res.status(200).json({ message: "Berhasil menghapus rekomendasi!" });
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
})

module.exports = hapus;
