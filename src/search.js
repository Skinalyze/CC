const express = require("express");
const mysql = require("mysql");
const search = express();

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

search.get("/search", async (req, res) => {
  const { product_name } = req.query;

  if (!product_name) {
    return res
      .status(400)
      .json({ message: "Bad Request: product_name is required" });
  }

  try {
    const arrayKata = product_name.split(" ");

    // Membuat bagian WHERE dari query dengan LIKE untuk setiap kata
    const conditions = arrayKata.map(() => `product_name LIKE ?`).join(" AND ");
    const sql = `SELECT * FROM skin_care WHERE ${conditions}`;

    // Menyiapkan nilai untuk parameter query
    const queryParams = arrayKata.map((kata) => `%${kata}%`);

    // Menjalankan query dengan nilai queryParams sebagai parameter
    const [result] = await dbPromise.query(sql, queryParams);

    // Mengembalikan hanya product_name
    const productNames = result.map((row) => row.product_name);

    return res.status(200).json({ product_names: productNames });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = search;
