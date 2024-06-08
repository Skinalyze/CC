const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const verifyToken = require("./functionToken");

const recommend_get = express();
recommend_get.use(cors());
recommend_get.use(express.json());

const dbPromise = require("./db");

// History [GET]
recommend_get.get('/history', verifyToken, async (req, res) => {
    const userId = req.user.id_user;

    if (!userId) {
        return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
    }

    try {
        const query_1 = "SELECT * FROM rekomendasi WHERE `id_user` = ?";
        const [rekomendasi] = await dbPromise.query(query_1, [userId]);

        if (rekomendasi.length === 0) {
            return res.status(404).json({ message: "Not Found: No recomendation found with the given id_user" });
        }
        const rekomendasiDetails = rekomendasi.map(row => row.id_rekomendasi);

        return res.status(200).json({ history: rekomendasiDetails });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = recommend_get;