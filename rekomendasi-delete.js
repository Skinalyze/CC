const express = require("express");
const mysql = require("mysql");
const app = express();

app.delete("/rekomendasi", (req, res) => {
  const { id_rekomendasi, id_user } = req.query;

  // Menghapus entri yang terkait terlebih dahulu
  const deleteRelatedEntriesQuery = `
      DELETE FROM skin_problem_rekomendasi
      WHERE id_rekomendasi = ?;
      
      DELETE FROM skin_care_rekomendasi
      WHERE id_rekomendasi = ?;
    `;

  db.query(
    deleteRelatedEntriesQuery,
    [id_rekomendasi, id_rekomendasi],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          status: "Server error",
          message: "Error executing query: " + err.message,
        });
      }

      // Menghapus entri dari tabel rekomendasi
      const deleteRecommendationQuery = `
        DELETE FROM rekomendasi
        WHERE id_rekomendasi = ? AND id_user = ?
      `;

      db.query(
        deleteRecommendationQuery,
        [id_rekomendasi, id_user],
        (err, results) => {
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
        }
      );
    }
  );
});
