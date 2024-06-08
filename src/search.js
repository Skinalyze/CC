const express = require("express");
const mysql = require("mysql2");
const search = express();
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

// Search Product [GET]
search.get('/search', verifyToken, async (req, res) => {
  const { product_name } = req.query;

  const userId = req.user.id_user;

  if (!userId) {
      return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
  }

  if (!product_name) {
      return res.status(400).json({ message: "Bad Request: product_name is required" });
  }

  try {
      const arrayKata = product_name.split(" ");

      const conditions = arrayKata.map(() => `product_name LIKE ?`).join(' AND ');
      const sql = `SELECT * FROM skin_care WHERE ${conditions}`;

      const queryParams = arrayKata.map(kata => `%${kata}%`);

      const [result] = await dbPromise.query(sql, queryParams);

      const productNames = result.map(row => row.product_name);

      return res.status(200).json({ product_names: productNames });
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = search;
