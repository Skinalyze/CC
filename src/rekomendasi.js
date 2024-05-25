const express = require("express");
const mysql = require("mysql");
const recommend = express.Router(); // Menggunakan Router dari express

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

// Middleware untuk parsing JSON request body
recommend.use(express.json());

// Route untuk mendapatkan produk berdasarkan kriteria
recommend.get("/products", (req, res) => {
  const { sensitif, id_tipe_skin_type, id_skin_problem } = req.query;
  console.log(sensitif, id_tipe_skin_type, id_skin_problem);

  let query = `
    SELECT skin_care.*
    FROM skin_care
    LEFT JOIN skin_care_type ON skin_care.id_skin_care = skin_care_type.id_skin_care
    LEFT JOIN skin_care_problem ON skin_care.id_skin_care = skin_care_problem.id_skin_care
    WHERE 1=1
  `;
  const queryParams = [];

  if (sensitif) {
    query += " AND skin_care.sensitif = ?";
    queryParams.push(sensitif);
  }

  if (id_tipe_skin_type) {
    query += " AND skin_care_type.id_tipe_skin_type = ?";
    queryParams.push(id_tipe_skin_type);
  }

  if (id_skin_problem) {
    const ids = id_skin_problem.split(",").map((id) => id.trim());
    query += ` AND skin_care_problem.id_skin_problem IN (${ids
      .map(() => "?")
      .join(",")})`;
    queryParams.push(...ids);
  }

  // Mengacak hasil di query
  query += " ORDER BY RAND()";

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Server error");
      return;
    }

    // Memproses hasil untuk mendapatkan 3 item acak untuk setiap jenis id_product_type
    const groupedResults = {};
    results.forEach((result) => {
      const type = result.id_product_type;
      if (!groupedResults[type]) {
        groupedResults[type] = [];
      }
      if (groupedResults[type].length < 3) {
        groupedResults[type].push(result);
      }
    });

    // Menggabungkan hasil dari setiap grup menjadi satu array
    const finalResults = Object.values(groupedResults).flat();

    res.json(finalResults);
  });
});

module.exports = recommend;
