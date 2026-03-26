const express = require("express");
const { fetchPois } = require("../controllers/poiController");

const router = express.Router();

router.get("/", fetchPois);

module.exports = router;
