const express = require("express");
const {
  getTripHistoryItem,
  listTripHistory,
  optimizeItinerary,
} = require("../controllers/itineraryController");
const { requireUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/history", requireUser, listTripHistory);
router.get("/history/:tripId", requireUser, getTripHistoryItem);
router.post("/", requireUser, optimizeItinerary);

module.exports = router;
