const express = require("express");
const detail = express();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
detail.use(cors());
detail.use(express.json());

detail.get('/search/detail', verify_token, async (req, res) => {
  const { id_skin_care } = req.query;

  const user_id = req.user.id_user;

  if (!user_id) {
      return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
  }

  if (!id_skin_care) {
      return res.status(400).json({ message: "Skin care tidak ditemukan!" });
  }

  try {
      const query_1 = "SELECT * FROM skin_care WHERE `id_skin_care` = ?";
      const [product] = await dbPromise.query(query_1, [id_skin_care]);

      const product_details = product[0];

      const query_2 = "SELECT nama_product FROM product_type WHERE `id_product_type` = ?";
      const [product_type_result] = await dbPromise.query(query_2, [product_details.id_product_type]);

      const product_type = product_type_result[0].nama_product;

      const query_3 = "SELECT id_skin_problem FROM skin_care_problem WHERE `id_skin_care` = ?";
      const [skin_problem_results] = await dbPromise.query(query_3, [product_details.id_skin_care]);

      const notable_effects_id = skin_problem_results.map(row => row.id_skin_problem);
      const notable_effects = [];

      for (const id of notable_effects_id) {
          const query_4 = "SELECT nama_problem FROM tipe_skin_problem WHERE `id_skin_problem` = ?";
          const [effect_result] = await dbPromise.query(query_4, [id]);

          if (effect_result.length > 0) {
              notable_effects.push(effect_result[0].nama_problem);
          }
      }

      const query_5 = "SELECT id_tipe_skin_type FROM skin_care_type WHERE `id_skin_care` = ?";
      const [skin_type_results] = await dbPromise.query(query_5, [product_details.id_skin_care]);

      const skin_type_id = skin_type_results.map(row => row.id_tipe_skin_type);
      const skin_type = [];

      for (const id of skin_type_id) {
          const query_6 = "SELECT nama FROM tipe_skin_type WHERE `id_tipe_skin_type` = ?";
          const [effect_result] = await dbPromise.query(query_6, [id]);

          if (effect_result.length > 0) {
              skin_type.push(effect_result[0].nama);
          }
      }

      return res.status(200).json({
          product_name: product_details.product_name,
          product_type: product_type,
          brand: product_details.brand,
          notable_effects: notable_effects,
          skin_type: skin_type,
          sensitif: product_details.sensitif,
          price: product_details.price,
          description: product_details.description,
          picture_src: product_details.picture_src
      });
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = detail;
