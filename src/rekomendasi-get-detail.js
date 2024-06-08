const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const verifyToken = require("./functionToken");

const recommend_get_detail = express();
recommend_get_detail.use(cors());
recommend_get_detail.use(express.json());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "skinalyze"
})

db.connect((err) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      return;
    }
    console.log("Connected to the MySQL database.");
  });  

const dbPromise = db.promise();

// History Details [GET]
recommend_get_detail.get('/history/detail', verifyToken, async (req, res) => {
    const { id_rekomendasi } = req.query;

    const userId = req.user.id_user;

    if (!userId) {
        return res.status(400).json({ message: "Diperlukan Login untuk mengakses laman ini" });
    }

    if (!id_rekomendasi) {
        return res.status(400).json({ message: "Terjadi kesalahan input" });
    }

    try{
        const query_1 = "SELECT * FROM rekomendasi WHERE `id_rekomendasi` = ?";
        const [rekomendasi] = await db.promise().query(query_1, [id_rekomendasi]);

        if (rekomendasi.length === 0) {
            return res.status(404).json({ message: "Terjadi kesalahan input" });
        }

        const rekomdasiDetails = rekomendasi[0];

        const query_2 = "SELECT id_skin_problem FROM skin_problem_rekomendasi WHERE `id_rekomendasi` = ?";
        const [skinProblem] = await db.promise().query(query_2, [id_rekomendasi]);
        
        const skinProblem_id = skinProblem.map(row => row.id_skin_problem);
        const skinProblemDetails = [];

        for (const id of skinProblem_id) {
            const query_3 = "SELECT nama FROM tipe_skin_problem WHERE `id_skin_problem` = ?";
            const [effectResult] = await db.promise().query(query_3, [id]);

            if (effectResult.length > 0) {
                skinProblemDetails.push(effectResult[0].nama);
            }
        }

        const query_4 = "SELECT id_skin_care FROM skin_care_rekomendasi WHERE `id_rekomendasi` = ?";
        const [skinCare] = await db.promise().query(query_4, [id_rekomendasi]);
        
        const skinCare_id = skinCare.map(row => row.id_skin_care);
        const skinCareDetails = [];

        for (const id of skinCare_id) {
            const query_5 = "SELECT product_name FROM skin_care WHERE `id_skin_care` = ?";
            const [effectResult] = await db.promise().query(query_5, [id]);

            if (effectResult.length > 0) {
                skinCareDetails.push(effectResult[0].product_name);
            }
        }

        const skin_type = [];

        const query_6 = "SELECT nama FROM tipe_skin_type WHERE `id_tipe_skin_type` = ?";
        const [effectResult] = await db.promise().query(query_6, [rekomdasiDetails.id_tipe_skin_type]);
        skin_type.push(effectResult[0].nama);
        
        if(rekomdasiDetails.sensitif == 1){
            skin_type.push("Sensitif");
        } 

        return res.status(200).json({
            timestamp: rekomdasiDetails.timestamp,
            userId: userId,
            skin_type: skin_type,
            skin_problem: skinProblemDetails,
            skin_care: skinCareDetails
        });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

module.exports = recommend_get_detail;
