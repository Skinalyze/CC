const express = require("express");
const hapus = express();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
hapus.use(cors());
hapus.use(express.json());

hapus.delete('/deleteRecommendation', verify_token, async (req, res) =>{
  const { id_rekomendasi } = req.body;

  const user_id = req.user.id_user;

  if (!user_id) {
      return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
  }

  if (!id_rekomendasi) {
    return res.status(400).json({ message: "Rekomendasi tidak ditemukan!" });
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
