const express = require("express");
const { optimizeItinerary } = require("../controllers/itineraryController");

const router = express.Router();

router.post("/", optimizeItinerary);

module.exports = router;
