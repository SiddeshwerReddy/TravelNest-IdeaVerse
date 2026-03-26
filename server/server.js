const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/extract-schedule", require("./routes/scheduleRoutes"));
app.use("/api/fetch-pois", require("./routes/poiRoutes"));
app.use("/api/optimize-itinerary", require("./routes/itineraryRoutes"));

app.get("/", (req, res) => {
  res.json({
    name: "Travel Nest API",
    status: "running",
    endpoints: [
      "POST /api/extract-schedule",
      "GET /api/fetch-pois",
      "POST /api/optimize-itinerary",
    ],
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
