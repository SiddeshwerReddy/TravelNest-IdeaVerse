const express = require("express");
const { optimizeItinerary } = require("../controllers/itineraryController");
const { requireUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", requireUser, optimizeItinerary);

module.exports = router;
