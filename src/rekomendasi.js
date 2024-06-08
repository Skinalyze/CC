const express = require("express");
const mysql = require("mysql2");
const recommend = express.Router();
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

// Middleware untuk parsing JSON request body
recommend.use(express.json());

// Recommendations [GET]
recommend.get('/recommendation', verifyToken, async (req, res) => {
  const { id_tipe_skin_type, id_skin_problem } = req.query;
  const userId = req.user.id_user;

  if (!userId) {
      return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
  }

  const sensitif = req.user.sensitif;

  let queryText = `
      SELECT skin_care.*
      FROM skin_care
      LEFT JOIN skin_care_type ON skin_care.id_skin_care = skin_care_type.id_skin_care
      LEFT JOIN skin_care_problem ON skin_care.id_skin_care = skin_care_problem.id_skin_care
      WHERE 1=1
  `;
  const queryParams = [];

  if (sensitif) {
      queryText += " AND skin_care.sensitif = ?";
      queryParams.push(sensitif);
  }

  if (id_tipe_skin_type) {
      queryText += " AND skin_care_type.id_tipe_skin_type = ?";
      queryParams.push(id_tipe_skin_type);
  }

  if (id_skin_problem) {
      const ids = id_skin_problem.split(",").map((id) => id.trim());
      queryText += ` AND skin_care_problem.id_skin_problem IN (${ids.map(() => "?").join(",")})`;
      queryParams.push(...ids);
  }

  // Mengacak hasil di query
  queryText += " ORDER BY RAND()";

  try {
    const results = await dbPromise.query(queryText, queryParams);
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
  } catch (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Server error");
  }
});

module.exports = recommend;
