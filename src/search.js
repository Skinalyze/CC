const express = require("express");
const search = express();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
search.use(cors());
search.use(express.json());

search.get('/search', verify_token, async (req, res) => {
    const { product_name } = req.query;

    const user_id = req.user.id_user;

    if (!user_id) {
        return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
    }

    if (!product_name) {
        return res.status(400).json({ message: "Terdapat Field yang kosong!" });
    }

    try {
        const array_kata = product_name.split(" ");

        const conditions = array_kata.map(() => `product_name LIKE ?`).join(' AND ');
        const query_1 = `SELECT * FROM skin_care WHERE ${conditions}`;

        const query_params = array_kata.map(kata => `%${kata}%`);

        const [result] = await dbPromise.query(query_1, query_params);

        const products = result.map(row => ({
            id_skin_care: row.id_skin_care,
            product_name: row.product_name,
            brand: row.brand,
            foto: row.picture_src
        }));

        return res.status(200).json(products);
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = search;
