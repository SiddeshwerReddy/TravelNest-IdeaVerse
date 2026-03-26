exports.optimizeItinerary = async (req, res) => {
  const { location, freeTime, interests = [], travelerMode = "leisure" } = req.body;

  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return res.status(400).json({
      error: "location with numeric lat and lng is required.",
    });
  }

  return res.status(501).json({
    message: "Itinerary optimization scaffolded. Scoring, routing, and Gemini synthesis will be implemented next.",
    travelerMode,
    freeTime: freeTime || null,
    interests,
    location,
    nextStep:
      "Apply cultural weighting, routing feasibility, clustering, and Gemini JSON synthesis before returning the final itinerary.",
  });
};
