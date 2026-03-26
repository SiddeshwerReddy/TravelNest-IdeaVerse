const Trip = require("../models/Trip");
const { fetchNearbyPois } = require("../services/overpassService");
const { calculateTravelMatrix } = require("../services/routingService");
const {
  buildDeterministicItinerary,
  deriveFreeSlots,
  optimizeCandidatePlaces,
} = require("../services/itineraryService");
const { generateStructuredItinerary, hasGeminiConfig } = require("../services/geminiService");
const { parseInterestInput } = require("../utils/interests");

exports.optimizeItinerary = async (req, res) => {
  try {
    const travelerMode = req.body.travelerMode || "leisure";
    const location = req.body.location
      ? {
          ...req.body.location,
          lat: Number(req.body.location.lat),
          lng: Number(req.body.location.lng),
        }
      : null;
    const notes = req.body.notes?.trim() || "";
    const preferences = parseInterestInput(req.body.interests);
    const freeSlots = deriveFreeSlots({
      travelerMode,
      freeSlots: req.body.freeSlots,
      availableMinutes: req.body.availableMinutes,
    });

    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
      return res.status(400).json({
        error: "location with numeric lat and lng is required.",
      });
    }

    let rawPois = Array.isArray(req.body.rawPois) && req.body.rawPois.length > 0 ? req.body.rawPois : [];

    if (rawPois.length === 0) {
      try {
        rawPois = await fetchNearbyPois({
          lat: location.lat,
          lng: location.lng,
          freeMinutes: freeSlots[0]?.durationMinutes || Number(req.body.availableMinutes) || 120,
          radiusMeters: req.body.radiusMeters ? Number(req.body.radiusMeters) : undefined,
          travelerMode,
          interests: preferences,
        });
      } catch (poiError) {
        console.warn("POI fetch failed during itinerary optimization:", poiError.message);
        rawPois = [];
      }
    }

    rawPois = rawPois
      .map((poi, index) => ({
        id: poi.id || `poi-${index + 1}`,
        name: poi.name || poi.label || `Stop ${index + 1}`,
        label: poi.label || poi.name || `Stop ${index + 1}`,
        lat: Number(poi.lat),
        lng: Number(poi.lng),
        category: poi.category || "landmark",
        categoryLabel: poi.categoryLabel || "Local Stop",
        cultureWeight: Number(poi.cultureWeight || 1.5),
        visitDurationMinutes: Number(poi.visitDurationMinutes || 45),
        tagSummary: poi.tagSummary || "",
        source: poi.source || "client",
        address: poi.address || "",
      }))
      .filter((poi) => Number.isFinite(poi.lat) && Number.isFinite(poi.lng));

    const prerankedPois = optimizeCandidatePlaces({
      pois: rawPois,
      travelerMode,
      interests: preferences,
      freeSlots,
      notes,
      limit: Math.min(rawPois.length, 36),
    });

    const routeReadyPois = await calculateTravelMatrix({
      origin: location,
      pois: prerankedPois.slice(0, 24),
      travelerMode,
      availableMinutes: Math.max(...freeSlots.map((slot) => slot.durationMinutes), 0),
    });

    const shortlistedPois = optimizeCandidatePlaces({
      pois: routeReadyPois,
      travelerMode,
      interests: preferences,
      freeSlots,
      notes,
      limit: 10,
    });

    const baseItinerary = buildDeterministicItinerary({
      travelerMode,
      location,
      interests: preferences,
      notes,
      freeSlots,
      shortlistedPois,
      rawPoiCount: rawPois.length,
    });

    const aiItinerary = await generateStructuredItinerary({
      travelerMode,
      location,
      interests: preferences,
      notes,
      baseItinerary,
    });

    const itinerary = aiItinerary || baseItinerary;
    let tripId = null;

    try {
      const savedTrip = await Trip.create({
        mode: travelerMode,
        location,
        preferences,
        notes,
        scheduleText: req.body.scheduleText || "",
        scheduleData: req.body.schedule || null,
        freeSlots,
        rawPois: rawPois.slice(0, 30),
        itinerary,
        sourceDocumentName: req.body.documentName || null,
      });

      tripId = savedTrip._id;
    } catch (persistError) {
      tripId = null;
    }

    res.json({
      tripId,
      ai: {
        provider: "gemini",
        configured: hasGeminiConfig(),
        used: Boolean(aiItinerary),
        stage: `${travelerMode}-itinerary-refinement`,
      },
      poiSource:
        rawPois.length > 0 ? Array.from(new Set(rawPois.map((poi) => poi.source || "unknown"))).join(", ") : "none",
      itinerary,
      rawPoiCount: rawPois.length,
      prerankedPoiCount: prerankedPois.length,
      selectedPoiCount: itinerary.mapPoints?.length || 0,
      location,
    });
  } catch (error) {
    console.error("optimizeItinerary failed:", error);
    res.status(500).json({
      error: error.message || "Failed to optimize itinerary.",
      stage: "optimize-itinerary",
    });
  }
};
