const express = require("express");
const mysql = require("mysql2");
const detail = express();
const verifyToken = require("./functionToken");


const dbPromise = require("./db");

// Detail Product [GET]
detail.get('/search/detail', verifyToken, async (req, res) => {
  const { id_skin_care } = req.query;

  const userId = req.user.id_user;

  if (!userId) {
      return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
  }

  if (!id_skin_care) {
      return res.status(400).json({ message: "id_skin_care diperlukan" });
  }

  try {
      const query_1 = "SELECT * FROM skin_care WHERE `id_skin_care` = ?";
      const [product] = await db.promise().query(query_1, [id_skin_care]);

      if (product.length === 0) {
          return res.status(404).json({ message: "Not Found: No product found with the given id_skin_care" });
      }

      const productDetails = product[0];

      const query_2 = "SELECT nama_product FROM product_type WHERE `id_product_type` = ?";
      const [productTypeResult] = await db.promise().query(query_2, [productDetails.id_product_type]);

      if (productTypeResult.length === 0) {
          return res.status(404).json({ message: "Not Found: No product type found with the given id_product_type" });
      }

      const product_type = productTypeResult[0].nama_product;

      const query_3 = "SELECT id_skin_problem FROM skin_care_problem WHERE `id_skin_care` = ?";
      const [skinProblemResults] = await db.promise().query(query_3, [productDetails.id_skin_care]);

      const notable_effects_id = skinProblemResults.map(row => row.id_skin_problem);
      const notable_effects = [];

      for (const id of notable_effects_id) {
          const query_4 = "SELECT nama FROM tipe_skin_problem WHERE `id_skin_problem` = ?";
          const [effectResult] = await db.promise().query(query_4, [id]);

          if (effectResult.length > 0) {
              notable_effects.push(effectResult[0].nama);
          }
      }

      const query_5 = "SELECT id_tipe_skin_type FROM skin_care_type WHERE `id_skin_care` = ?";
      const [skinTypeResults] = await db.promise().query(query_5, [productDetails.id_skin_care]);

      const skin_type_id = skinTypeResults.map(row => row.id_tipe_skin_type);
      const skin_type = [];

      for (const id of skin_type_id) {
          const query_6 = "SELECT nama FROM tipe_skin_type WHERE `id_tipe_skin_type` = ?";
          const [effectResult] = await db.promise().query(query_6, [id]);

          if (effectResult.length > 0) {
              skin_type.push(effectResult[0].nama);
          }
      }

      if(productDetails.sensitif == 1){
          skin_type.push("Sensitif");
      } 

      return res.status(200).json({
          product_name: productDetails.product_name,
          product_type: product_type,
          brand: productDetails.brand,
          notable_effects: notable_effects,
          skin_type: skin_type,
          price: productDetails.price,
          description: productDetails.description,
          picture_src: productDetails.picture_src
      });

  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = detail;
