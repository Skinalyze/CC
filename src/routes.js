const express = require("express");
const recommend = require("./rekomendasi");
const hapus = require("./rekomendasi-delete");
const router = express.Router();

// Rute untuk produk rekomendasi
router.use("/", recommend);
router.use("/", hapus);

module.exports = router;
