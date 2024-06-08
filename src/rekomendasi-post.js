const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const verifyToken = require("./functionToken");
const recommend_post = express.Router();
const dbPromise = require("./db");

// History [POST]
recommend_post.post('/postRecommendation', verifyToken, async (req, res) => {
    const { id_tipe_skin_type, id_skin_problem, id_skin_care } = req.body;

    const userId = req.user.id_user; // Mengambil id_user dari token yang terverifikasi
    const sensitif = req.user.sensitif; // Mengambil id_user dari token yang terverifikasi

    const arrayKata_skin_prob = id_skin_problem.split(",");
    const arrayKata_skin_care = id_skin_care.split(",");

    try {
        const query_1 = "INSERT INTO rekomendasi (`id_user`, `sensitif`, `id_tipe_skin_type`, `timestamp`) VALUES (?, ?, ?, ?)";
        const values_1 = [userId, sensitif, id_tipe_skin_type, new Date().toISOString()];
        const [result] = await dbPromise.query(query_1, values_1);

        const id_rekomendasi = result.insertId; // Mengambil id_rekomendasi dari hasil insert

        const promises_1 = arrayKata_skin_prob.map(async (id_skin_problem_1) => {
            const sql_2 = "INSERT INTO skin_problem_rekomendasi (`id_rekomendasi`, `id_skin_problem`) VALUES (?, ?)";
            const values_2 = [id_rekomendasi, id_skin_problem_1];
            await dbPromise.query(sql_2, values_2);
        });

        const promises_2 = arrayKata_skin_care.map(async (id_skin_care_1) => {
            const sql_3 = "INSERT INTO skin_care_rekomendasi (`id_rekomendasi`, `id_skin_care`) VALUES (?, ?)";
            const values_3 = [id_rekomendasi, id_skin_care_1];
            await dbPromise.query(sql_3, values_3);
        });

        await Promise.all([...promises_1, ...promises_2]);

        return res.status(201).json({ message: "Recommendation and related data created successfully." });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = recommend_post;