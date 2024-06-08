const express = require("express");
const recommend = require("./rekomendasi");
const recommend_post = require("./rekomendasi-post");
const recommend_get = require("./rekomendasi-get");
const recommend_get_detail = require("./rekomendasi-get-detail");
const register = require("./register");
const hapus = require("./rekomendasi-delete");
const login = require("./login");
const search = require("./search");
const detail = require("./search-detail");
const update = require("./skintype-update");
const router = express.Router();

// Rute untuk produk rekomendasi
router.use("/", recommend);
router.use("/", hapus);
router.use("/", register);
router.use("/", login);
router.use("/", update);
router.use("/", search);
router.use("/", detail);
router.use("/", recommend_get);
router.use("/", recommend_post);
router.use("/", recommend_get_detail);


module.exports = router;
