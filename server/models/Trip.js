const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  userId: String,
  mode: {
    type: String,
    enum: ["business", "leisure"],
  },
  location: {
    lat: Number,
    lng: Number,
  },
  preferences: [String],
  schedule: String,
  recommendations: Array,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Trip", TripSchema);