const express = require("express");
const logout = express();
const verify_token = require("./functionToken");
const dbPromise = require("./db");

const cors = require("cors");
logout.use(cors());
logout.use(express.json());

logout.post('/logout', verify_token, async (req, res) => {
    const user_id = req.user.id_user;
  
    if (!user_id) {
        return res.status(400).json({ message: "User ID is required." });
    }
  
    try {
        const query_1 = "UPDATE user SET `refresh_token` = NULL WHERE `id_user` = ?";
        await dbPromise.query(query_1, [user_id]);
  
        return res.status(200).json({ message: "Logout successfully." });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = logout;
