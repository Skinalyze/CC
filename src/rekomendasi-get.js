const express = require("express");
const recommend_get = express();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
recommend_get.use(cors());
recommend_get.use(express.json());

recommend_get.get('/history', verify_token, async (req, res) => {
    const user_id = req.user.id_user;

    if (!user_id) {
        return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
    }

    try {
        const query_1 = "SELECT * FROM rekomendasi WHERE `id_user` = ?";
        const [rekomendasi] = await dbPromise.query(query_1, [user_id]);

        if (rekomendasi.length === 0) {
            return res.status(404).json({ message: "Rekomendasi tidak ditemukan!" });
        }

        const recommendations = [];

        for (const rec of rekomendasi) {
            const { id_rekomendasi, sensitif, id_tipe_skin_type, timestamp } = rec;

            const query_2 = "SELECT nama FROM tipe_skin_type WHERE `id_tipe_skin_type` = ?";
            const [skin_type_result] = await dbPromise.query(query_2, [id_tipe_skin_type]);
            const skin_type = skin_type_result.length > 0 ? skin_type_result[0].nama : null;

            const query_3 = "SELECT id_skin_problem FROM skin_problem_rekomendasi WHERE `id_rekomendasi` = ?";
            const [skin_problem] = await dbPromise.query(query_3, [id_rekomendasi]);

            const skin_problem_details = [];
            for (const problem of skin_problem) {
                const query_3 = "SELECT nama_problem FROM tipe_skin_problem WHERE `id_skin_problem` = ?";
                const [problem_result] = await dbPromise.query(query_3, [problem.id_skin_problem]);

                if (problem_result.length > 0) {
                    skin_problem_details.push(problem_result[0].nama_problem);
                }
            }

            recommendations.push({
                id_rekomendasi: id_rekomendasi,
                sensitif: sensitif,
                skin_type: skin_type,
                skin_problem: skin_problem_details.join(', '),
                timestamp: timestamp
            });
        }

        return res.status(200).json(recommendations);

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = recommend_get;
