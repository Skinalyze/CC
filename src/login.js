const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwt_secret, jwt_refresh } = require('./jwt');
const login = express();
const dbPromise = require("./db");

const cors = require("cors");
login.use(cors());
login.use(express.json());

login.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: "Terdapat Field yang kosong!" });
  }

  try {
      const query_1 = "SELECT * FROM user WHERE `email` = ?";
      const [result] = await dbPromise.query(query_1, [email]);

      if (result.length === 0) {
          return res.status(401).json({ message: "Invalid email." });
      }

      const user = result[0];
      const password_valid = bcrypt.compareSync(password, user.password);
      if (!password_valid) {
          return res.status(401).json({ message: "Invalid password." });
      }

      const token = jwt.sign({ id_user: user.id_user }, jwt_secret.secret, jwt_secret.options);
      const refresh_token = jwt.sign({ id_user: user.id_user }, jwt_refresh.secret, jwt_refresh.options);

      const query_2 = "UPDATE user SET `refresh_token` = ? WHERE `id_user` = ?";
      const values = [refresh_token, user.id_user];
      await dbPromise.query(query_2, values);

      return res.status(200).json({ message: "Login successfully.",
                                    id_user: user.id_user,
                                    access_token: token,
                                    refresh_token: refresh_token});
  } catch (err) {
      console.error("Error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = login;
