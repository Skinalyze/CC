const express = require("express");
const recommend_post = express.Router();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
recommend_post.use(cors());
recommend_post.use(express.json());

function format_date_to_mysql(datetime) {
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

recommend_post.post('/postRecommendation', verify_token, async (req, res) => {
    const { id_tipe_skin_type, id_skin_problem } = req.body;

    const user_id = req.user.id_user;

    if (!user_id) {
        return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
    }

    if (!id_tipe_skin_type || !id_skin_problem) {
        return res.status(400).json({ message: "Terdapat Field yang kosong!" });
    }

    let query_text = `
        SELECT skin_care.*, skin_care_type.id_tipe_skin_type, skin_care_problem.id_skin_problem
        FROM skin_care
        LEFT JOIN skin_care_type ON skin_care.id_skin_care = skin_care_type.id_skin_care
        LEFT JOIN skin_care_problem ON skin_care.id_skin_care = skin_care_problem.id_skin_care
        WHERE 1=1
    `;

    const array_kata_skin_prob = id_skin_problem.split(",");

    const query_params = [];

    try {
        const query_1 = "SELECT * FROM user WHERE `id_user` = ?";
        const [res_user] = await dbPromise.query(query_1, [user_id]);

        if (res_user.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const user = res_user[0];
        const sensitif = user.sensitif;

        const query_2 = "INSERT INTO rekomendasi (`id_user`, `sensitif`, `id_tipe_skin_type`, `timestamp`) VALUES (?, ?, ?, ?)";
        const formatted_timestamp = format_date_to_mysql(new Date().toISOString());
        const values_1 = [user_id, sensitif, id_tipe_skin_type, formatted_timestamp];
        const [result] = await dbPromise.query(query_2, values_1);

        const id_rekomendasi = result.insertId;

        if (sensitif) {
            query_text += " AND skin_care.sensitif = ?";
            query_params.push(sensitif);
        }

        if (id_tipe_skin_type) {
            query_text += " AND skin_care_type.id_tipe_skin_type = ?";
            query_params.push(id_tipe_skin_type);
        }

        if (id_skin_problem) {
            const ids = id_skin_problem.split(",").map((id) => id.trim());
            query_text += ` AND skin_care_problem.id_skin_problem IN (${ids.map(() => "?").join(",")})`;
            query_params.push(...ids);
        }

        query_text += " ORDER BY RAND()";

        const [rows] = await dbPromise.query(query_text, query_params);

        const promises_1 = array_kata_skin_prob.map(async (id_skin_problem_1) => {
            const query_3 = "INSERT INTO skin_problem_rekomendasi (`id_rekomendasi`, `id_skin_problem`) VALUES (?, ?)";
            const values_2 = [id_rekomendasi, id_skin_problem_1];
            await dbPromise.query(query_3, values_2);
        });

        const skin_care_result = {};
        rows.forEach((result) => {
            const type = result.id_product_type;
            if (!skin_care_result[type]) {
                skin_care_result[type] = [];
            }
            if (skin_care_result[type].length < 3) {
                skin_care_result[type].push(result.id_skin_care);
            }
        });

        const array_kata_skin_care = Object.values(skin_care_result).flat();

        const promises_2 = array_kata_skin_care.map(async (id_skin_care_1) => {
            const query_4 = "INSERT INTO skin_care_rekomendasi (`id_rekomendasi`, `id_skin_care`) VALUES (?, ?)";
            const values_3 = [id_rekomendasi, id_skin_care_1];
            await dbPromise.query(query_4, values_3);
        });

        await Promise.all([...promises_1, ...promises_2]);

        return res.status(201).json({ message: "Recommendation and related data created successfully.", id_rekomendasi: id_rekomendasi });

    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Server error");
    }
});

module.exports = recommend_post;
