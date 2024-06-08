const express = require("express");
const recommend = require("./rekomendasi");
const register = require("./register");
const hapus = require("./rekomendasi-delete");
const login = require("./login");
const update = require("./skintype-update");
const router = express.Router();

// Rute untuk produk rekomendasi
router.use("/", recommend);
router.use("/", hapus);
router.use("/", register);
router.use("/", login);
router.use("/", update);

module.exports = router;
