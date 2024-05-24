const express = require("express");
const mysql = require("mysql");
const app = express();
const port = 8081;

app.delete("/rekomendasi", (req, res) => {
  const { id_rekomendasi, id_user } = req.query;

  if (!id_rekomendasi || !id_user) {
    return res.status(400).json({
      status: "fail",
      message: "id_rekomendasi and id_user are required",
    });
  }

  // Menghapus entri dari tabel rekomendasi
  const deleteRecommendationQuery = `
      DELETE FROM rekomendasi
      WHERE id_rekomendasi = ? AND id_user = ?
  `;
  
  db.query(deleteRecommendationQuery, [id_rekomendasi, id_user], (err, results) => {
    if (err) {
      return res.status(500).json({
        status: "Server error",
        message: "Error executing query: " + err.message,
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Recommendation not found or not authorized to delete",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Recommendation deleted successfully",
    });
  });
});
