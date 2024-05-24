const express = require("express");
const mysql = require("mysql");
const app = express();

app.delete("/rekomendasi", async (req, res) => {
  const { id_rekomendasi, id_user } = req.query;

  if (!id_rekomendasi || !id_user) {
    return res.status(400).json({
      status: "fail",
      message: "id_rekomendasi and id_user are required",
    });
  }

  // Mulai transaksi
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({
        status: "Server error",
        message: "Error starting transaction: " + err.message,
      });
    }

    try {
      // Menghapus entri yang terkait terlebih dahulu
      const deleteSkinProblemRekomendasi = `
        DELETE FROM skin_problem_rekomendasi WHERE id_rekomendasi = ?;
      `;
      await new Promise((resolve, reject) => {
        db.query(
          deleteSkinProblemRekomendasi,
          [id_rekomendasi],
          (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          }
        );
      });

      const deleteSkinCareRekomendasi = `
        DELETE FROM skin_care_rekomendasi WHERE id_rekomendasi = ?;
      `;
      await new Promise((resolve, reject) => {
        db.query(
          deleteSkinCareRekomendasi,
          [id_rekomendasi],
          (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          }
        );
      });

      // Menghapus entri dari tabel rekomendasi
      const deleteRecommendationQuery = `
        DELETE FROM rekomendasi WHERE id_rekomendasi = ? AND id_user = ?;
      `;
      const deleteResult = await new Promise((resolve, reject) => {
        db.query(
          deleteRecommendationQuery,
          [id_rekomendasi, id_user],
          (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          }
        );
      });

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({
          status: "fail",
          message: "Recommendation not found or not authorized to delete",
        });
      }

      // Commit transaksi
      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({
              status: "Server error",
              message: "Error committing transaction: " + err.message,
            });
          });
        }

        res.status(200).json({
          status: "success",
          message: "Recommendation deleted successfully",
        });
      });
    } catch (err) {
      // Rollback transaksi jika ada kesalahan
      db.rollback(() => {
        res.status(500).json({
          status: "Server error",
          message: "Error executing query: " + err.message,
        });
      });
    }
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

