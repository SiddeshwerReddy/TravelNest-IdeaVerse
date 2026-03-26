exports.fetchPois = async (req, res) => {
  const { lat, lng, freeMinutes } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      error: "lat and lng query parameters are required.",
    });
  }

  return res.status(501).json({
    message: "POI fetch scaffolded. Overpass integration will be implemented next.",
    location: { lat, lng },
    freeMinutes: freeMinutes || null,
    nextStep:
      "Query nearby POIs from Overpass and return a normalized pool for itinerary scoring.",
  });
};
