const express = require("express");
const { fetchPois } = require("../controllers/poiController");
const { requireUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", requireUser, fetchPois);

module.exports = router;
