const express = require("express");
const update = express();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
update.use(cors());
update.use(express.json());

update.put('/skintype', verify_token, async (req, res) => {
  const { skintypes, sensitif } = req.body;

  const user_id = req.user.id_user;

  if (!user_id) {
      return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
  }

  if (!skintypes || !sensitif) {
      return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  try {
      const query_1 = "UPDATE user SET `skintypes` = ?, `sensitif` = ? WHERE `id_user` = ?";
      const values = [skintypes, sensitif, user_id];
      await dbPromise.query(query_1, values);

      return res.status(200).json({ message: "Skin type berhasil diperbarui!" });
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = update;
