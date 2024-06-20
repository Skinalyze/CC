const express = require("express");
const recommend_get_detail = express();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
recommend_get_detail.use(cors());
recommend_get_detail.use(express.json());

recommend_get_detail.get('/history/detail', verify_token, async (req, res) => {
    const { id_rekomendasi } = req.query;

    const user_id = req.user.id_user;

    if (!user_id) {
        return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
    }

    if (!id_rekomendasi) {
        return res.status(400).json({ message: "Rekomendasi tidak ditemukan!" });
    }

    try {
        const query_1 = "SELECT * FROM rekomendasi WHERE `id_rekomendasi` = ?";
        const [rekomendasi] = await dbPromise.query(query_1, [id_rekomendasi]);

        if (rekomendasi.length === 0) {
            return res.status(404).json({ message: "Rekomendasi tidak ditemukan!" });
        }

        const rekomendasi_details = rekomendasi[0];

        const query_2 = "SELECT id_skin_problem FROM skin_problem_rekomendasi WHERE `id_rekomendasi` = ?";
        const [skin_problem] = await dbPromise.query(query_2, [id_rekomendasi]);

        const skin_problem_details_promises = skin_problem.map(async row => {
            const query_3 = "SELECT nama_problem FROM tipe_skin_problem WHERE `id_skin_problem` = ?";
            const [effect_result] = await dbPromise.query(query_3, [row.id_skin_problem]);
            return effect_result.length > 0 ? effect_result[0].nama_problem : null;
        });

        const skin_problem_details = (await Promise.all(skin_problem_details_promises)).filter(Boolean);

        const query_4 = "SELECT id_skin_care FROM skin_care_rekomendasi WHERE `id_rekomendasi` = ?";
        const [skin_care] = await dbPromise.query(query_4, [id_rekomendasi]);

        const skin_care_details_promises = skin_care.map(async row => {
            const query_5 = "SELECT * FROM skin_care WHERE `id_skin_care` = ?";
            const [effect_result] = await dbPromise.query(query_5, [row.id_skin_care]);
            if (effect_result.length > 0) {
                const product = effect_result[0];
                return {
                    id_skin_care: product.id_skin_care,
                    product_name: product.product_name,
                    brand: product.brand,
                    picture_src: product.picture_src
                };
            }
            return null;
        });

        const skin_care_details = (await Promise.all(skin_care_details_promises)).filter(Boolean);

        const query_6 = "SELECT nama FROM tipe_skin_type WHERE `id_tipe_skin_type` = ?";
        const [skin_type_result] = await dbPromise.query(query_6, [rekomendasi_details.id_tipe_skin_type]);

        const skin_type = skin_type_result.length > 0 ? [skin_type_result[0].nama] : [];

        if (rekomendasi_details.sensitif == 1) {
            skin_type.push("Sensitif");
        }

        return res.status(200).json({
            timestamp: rekomendasi_details.timestamp,
            userId: user_id,
            skin_type: skin_type,
            skin_problem: skin_problem_details,
            skin_care: skin_care_details
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = recommend_get_detail;
