const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Tambahkan ini untuk JWT

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "skinalyze"
})

const dbPromise = db.promise();

const SECRET_KEY = "emyujuaraeplfixtaundpn"; // Gantilah dengan secret key yang aman

// Middleware untuk verifikasi token dan ekstrak id_user
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Authorization header is required.' });
    }

    const token = authHeader.split(' ')[1]; // Mengambil token setelah 'Bearer'
    if (!token) {
        return res.status(403).json({ message: 'Bearer token is required.' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = decoded; // Menyimpan payload token di req.user
        next();
    });
}

// Register [POST]
app.post('/register', (req, res) => {
    const { nama, email, password, gender, age } = req.body;
    
    // Validasi input
    if (!nama || !email || !password || !gender || !age) {
        return res.status(400).json({ message: "Terdapat Field yang kosong!" });
    }

    // Validasi email
    const query_1 = "SELECT * FROM user WHERE `email` = ?";
    db.query(query_1, [email], (err, result) => {
        if (err) {
            console.error("Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        
        if (result.length > 0) {
            return res.status(409).json({ message: "Email sudah terdaftar." });
        }

        // Enkripsi password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Ubah tipe data gender
        let genderValue = (gender.toLowerCase() === 'laki-laki') ? 0 : 1;

        // Memasukan data ke tabel user
        const query_2 = "INSERT INTO user (`nama`, `email`, `password`, `gender`, `age`) VALUES (?, ?, ?, ?, ?)";
        const values = [nama, email, hashedPassword, genderValue, age];
        db.query(query_2, values, (err) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }

            return res.status(201).json({ message: "User berhasil dibuat." });
        });
    });
});

// Login [POST]
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
        return res.status(400).json({ message: "Terdapat Field yang kosong!" });
    }

    // Periksa apakah email ada di database
    const sql = "SELECT * FROM user WHERE `email` = ?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        
        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid email." });
        }

        // Periksa password
        const user = result[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }

        // Buat token
        const token = jwt.sign({ id_user: user.id_user }, SECRET_KEY, { expiresIn: '1h' });

        return res.status(200).json({ message: "Login successfully.", token: token, email: user.email });
    });
});

// Update Skin Type User [PUT]
app.put('/skintype', (req, res) => {
    const { id_user, skintypes, sensitif } = req.body;

    // Validasi input
    if (!id_user || !skintypes || !sensitif) {
        return res.status(400).json({ message: "Terdapat Field yang kosong!" });
    }

    // Melakukan update data ke tabel user
    const sql = "UPDATE user SET `skintypes` = ?, `sensitif` = ? WHERE `id_user` = ?";
    const values = [skintypes, sensitif, id_user];
    db.query(sql, values, (err) => {
        if (err) {
            console.error("Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        return res.status(201).json({ message: "Skin type updated successfully." });
    });
});

// Search Product [GET]
app.get('/search', async (req, res) => {
    const { product_name } = req.query;

    if (!product_name) {
        return res.status(400).json({ message: "Bad Request: product_name is required" });
    }

    try {
        const arrayKata = product_name.split(" ");

        // Membuat bagian WHERE dari query dengan LIKE untuk setiap kata
        const conditions = arrayKata.map(() => `product_name LIKE ?`).join(' AND ');
        const sql = `SELECT * FROM skin_care WHERE ${conditions}`;

        // Menyiapkan nilai untuk parameter query
        const queryParams = arrayKata.map(kata => `%${kata}%`);

        // Menjalankan query dengan nilai queryParams sebagai parameter
        const [result] = await dbPromise.query(sql, queryParams);

        // Mengembalikan hanya product_name
        const productNames = result.map(row => row.product_name);

        return res.status(200).json({ product_names: productNames });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Detail Product [GET]
app.get('/detail', async (req, res) => {
    const { id_skin_care } = req.query;

    if (!id_skin_care) {
        return res.status(400).json({ message: "Bad Request: id_skin_care is required" });
    }

    try {
        const query_1 = "SELECT * FROM skin_care WHERE `id_skin_care` = ?";
        const [product] = await db.promise().query(query_1, [id_skin_care]);

        if (product.length === 0) {
            return res.status(404).json({ message: "Not Found: No product found with the given id_skin_care" });
        }

        const productDetails = product[0];

        const query_2 = "SELECT nama_product FROM product_type WHERE `id_product_type` = ?";
        const [productTypeResult] = await db.promise().query(query_2, [productDetails.id_product_type]);

        if (productTypeResult.length === 0) {
            return res.status(404).json({ message: "Not Found: No product type found with the given id_product_type" });
        }

        const product_type = productTypeResult[0].nama_product;

        const query_3 = "SELECT id_skin_problem FROM skin_care_problem WHERE `id_skin_care` = ?";
        const [skinProblemResults] = await db.promise().query(query_3, [productDetails.id_skin_care]);

        const notable_effects_id = skinProblemResults.map(row => row.id_skin_problem);
        const notable_effects = [];

        for (const id of notable_effects_id) {
            const query_4 = "SELECT nama FROM tipe_skin_problem WHERE `id_skin_problem` = ?";
            const [effectResult] = await db.promise().query(query_4, [id]);

            if (effectResult.length > 0) {
                notable_effects.push(effectResult[0].nama);
            }
        }

        const query_5 = "SELECT id_tipe_skin_type FROM skin_care_type WHERE `id_skin_care` = ?";
        const [skinTypeResults] = await db.promise().query(query_5, [productDetails.id_skin_care]);

        const skin_type_id = skinTypeResults.map(row => row.id_tipe_skin_type);
        const skin_type = [];

        for (const id of skin_type_id) {
            const query_6 = "SELECT nama FROM tipe_skin_type WHERE `id_tipe_skin_type` = ?";
            const [effectResult] = await db.promise().query(query_6, [id]);

            if (effectResult.length > 0) {
                skin_type.push(effectResult[0].nama);
            }
        }

        if(productDetails.sensitif == 1){
            skin_type.push("Sensitif");
        } 

        return res.status(200).json({
            product_name: productDetails.product_name,
            product_type: product_type,
            brand: productDetails.brand,
            notable_effects: notable_effects,
            skin_type: skin_type,
            price: productDetails.price,
            description: productDetails.description,
            picture_src: productDetails.picture_src
        });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Recommendations [GET]
app.get('/recommendation', (req, res) => {
    const { sensitif, id_tipe_skin_type, id_skin_problem } = req.query;
    console.log(sensitif, id_tipe_skin_type, id_skin_problem);
  
    let query = `
      SELECT skin_care.*
      FROM skin_care
      LEFT JOIN skin_care_type ON skin_care.id_skin_care = skin_care_type.id_skin_care
      LEFT JOIN skin_care_problem ON skin_care.id_skin_care = skin_care_problem.id_skin_care
      WHERE 1=1
    `;
    const queryParams = [];
  
    if (sensitif) {
      query += " AND skin_care.sensitif = ?";
      queryParams.push(sensitif);
    }
  
    if (id_tipe_skin_type) {
      query += " AND skin_care_type.id_tipe_skin_type = ?";
      queryParams.push(id_tipe_skin_type);
    }
  
    if (id_skin_problem) {
      const ids = id_skin_problem.split(",").map((id) => id.trim());
      query += ` AND skin_care_problem.id_skin_problem IN (${ids
        .map(() => "?")
        .join(",")})`;
      queryParams.push(...ids);
    }
  
    // Mengacak hasil di query
    query += " ORDER BY RAND()";
  
    db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Server error");
        return;
      }
  
      // Memproses hasil untuk mendapatkan 3 item acak untuk setiap jenis id_product_type
      const groupedResults = {};
      results.forEach((result) => {
        const type = result.id_product_type;
        if (!groupedResults[type]) {
          groupedResults[type] = [];
        }
        if (groupedResults[type].length < 3) {
          groupedResults[type].push(result);
        }
      });
  
      // Menggabungkan hasil dari setiap grup menjadi satu array
      const finalResults = Object.values(groupedResults).flat();
  
      res.json(finalResults);
    });
});

// History [POST]
app.post('/postRecommendation', async (req, res) => {
    const { timestamp, id_user, id_tipe_skin_type, sensitif, id_skin_problem, id_skin_care } = req.body;



    const arrayKata_skin_prob = id_skin_problem.split(",");
    const arrayKata_skin_care = id_skin_care.split(",");

    try {
        const query_1 = "INSERT INTO rekomendasi (`id_user`, `sensitif`, `id_tipe_skin_type`, `timestamp`) VALUES (?, ?, ?, ?)";
        const values_1 = [id_user, sensitif, id_tipe_skin_type, timestamp];
        const [result] = await dbPromise.query(query_1, values_1);

        const id_rekomendasi = result.insertId; // Mengambil id_rekomendasi dari hasil insert

        const promises_1 = arrayKata_skin_prob.map((id_skin_problem_1) => {
            const sql_2 = "INSERT INTO skin_problem_rekomendasi (`id_rekomendasi`, `id_skin_problem`) VALUES (?, ?)";
            const values_2 = [id_rekomendasi, id_skin_problem_1];
            return dbPromise.query(sql_2, values_2);
        });

        const promises_2 = arrayKata_skin_care.map((id_skin_care_1) => {
            const sql_3 = "INSERT INTO skin_care_rekomendasi (`id_rekomendasi`, `id_skin_care`) VALUES (?, ?)";
            const values_3 = [id_rekomendasi, id_skin_care_1];
            return dbPromise.query(sql_3, values_3);
        });

        await Promise.all([...promises_1, ...promises_2]);

        return res.status(201).json({ message: "Recommendation and related data created successfully." });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// History [GET]
app.get('/history', async (req, res) => {
    const { id_user } = req.query;
        
    if (!id_user) {
        return res.status(400).json({ message: "Bad Request: id user is required" });
    }

    try {
        const query_1 = "SELECT * FROM rekomendasi WHERE `id_user` = ?";
        const [rekomendasi] = await db.promise().query(query_1, [id_user]);

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

// History Details [GET]
app.get('/history/detail', async (req, res) => {
    const { id_rekomendasi, id_user } = req.query;

    if (!id_rekomendasi || !id_user) {
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
            userId: id_user,
            skin_type: skin_type,
            skin_problem: skinProblemDetails,
            skin_care: skinCareDetails
        });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

// Delete History Details

app.listen(8081, ()=> {
    console.log("listening");
})
