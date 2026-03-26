const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["business", "leisure"],
    },
    location: {
      label: String,
      lat: Number,
      lng: Number,
    },
    preferences: [String],
    notes: String,
    scheduleText: String,
    scheduleData: mongoose.Schema.Types.Mixed,
    freeSlots: [mongoose.Schema.Types.Mixed],
    rawPois: [mongoose.Schema.Types.Mixed],
    itinerary: mongoose.Schema.Types.Mixed,
    sourceDocumentName: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", TripSchema);
