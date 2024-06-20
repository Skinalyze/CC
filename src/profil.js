const express = require("express");
const profil = express();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
profil.use(cors());
profil.use(express.json());

profil.get('/profil', verify_token, async (req, res) => {
    const user_id = req.user.id_user;

    if (!user_id) {
        return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
    }

    try {
        const query_1 = "SELECT * FROM user WHERE `id_user` = ?";
        const [res_user] = await dbPromise.query(query_1, [user_id]);
        const user = res_user[0];
        const nama = user.nama;
        const email = user.email;
        const age = user.age;
        const gender = user.gender;
        const skin_types = user.skintypes;
        const sensitif = user.sensitif;

        const query_2 = "SELECT nama FROM tipe_skin_type WHERE `id_tipe_skin_type` = ?";
        const [skin_type_result] = await dbPromise.query(query_2, [skin_types]);
        const skin_type = skin_type_result.length > 0 ? skin_type_result[0].nama : null;

        return res.status(200).json({
            nama: nama,
            email: email,
            gender: gender,
            age: age,
            skintype: skin_type,
            sensitif: sensitif
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = profil;
