const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Tambahkan ini untuk JWT

const app = express();
app.use(cors());
app.use(express.json());

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ message: 'Authorization header is required.' });
    }

    const token = authHeader.split(' ')[1]; // Mengambil token setelah 'Bearer'
    if (!token) {
        return res.status(403).json({ message: 'Bearer token is required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = decoded; // Menyimpan payload token di req.user
        next();
    });
}

module.exports = verifyToken