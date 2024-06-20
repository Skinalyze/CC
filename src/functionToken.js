const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());

function verify_token(req, res, next) {
    const auth_header = req.headers['authorization'];
    if (!auth_header) {
        return res.status(403).json({ message: 'Authorization header is required.' });
    }

    const token = auth_header.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Bearer token is required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = decoded;
        next();
    });
}

module.exports = verify_token;
