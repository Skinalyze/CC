const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwt_secret, jwt_refresh } = require('./jwt');
const token = express();
const dbPromise = require("./db");

const cors = require("cors");
token.use(cors());
token.use(express.json());

token.post('/refresh-token', async (req, res) => {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
        return res.status(400).json({ message: "Refresh token is required." });
    }
  
    try {
        const decoded = jwt.verify(refresh_token, jwt_refresh.secret);
        const { id_user } = decoded;

        const sql = "SELECT * FROM user WHERE `id_user` = ?";
        const [result] = await dbPromise.query(sql, [id_user]);
  
        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid refresh token." });
        }
  
        const user = result[0];

        const newToken = jwt.sign({ id_user: user.id_user }, jwt_secret.secret, jwt_secret.options);
  
        return res.status(200).json({ message: "Token refreshed successfully.", 
                                      access_token: newToken });
    } catch (err) {
        console.error("Error:", err);
        return res.status(401).json({ message: "Invalid refresh token." });
    }
  });

  module.exports = token;
