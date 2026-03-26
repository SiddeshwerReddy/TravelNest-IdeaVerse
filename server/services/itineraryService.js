const { buildFreeSlots, minutesToClockLabel, parseTimeToMinutes } = require("../utils/time");
const { parseInterestInput } = require("../utils/interests");

function getInterestCategoryMatches(poi, interests) {
  const categories = `${poi.category || ""} ${poi.categoryLabel || ""} ${poi.name || ""} ${poi.tagSummary || ""}`.toLowerCase();

  return parseInterestInput(interests).filter((interest) => {
    if (/food|coffee|cafe|restaurant|street food|dining/.test(interest)) {
      return /cafe|restaurant|food|market/.test(categories);
    }

    if (/art|gallery|design|museum|culture/.test(interest)) {
      return /museum|gallery|art/.test(categories);
    }

    if (/history|heritage|historic|architecture|fort|monument/.test(interest)) {
      return /historic|heritage|monument|museum|fort/.test(categories);
    }

    if (/nature|park|garden|walk|outdoor|sunset|view/.test(interest)) {
      return /park|garden|viewpoint|nature/.test(categories);
    }

    if (/temple|church|mosque|spiritual|religious/.test(interest)) {
      return /worship|temple|church|mosque/.test(categories);
    }

    return categories.includes(interest);
  });
}

function getNoteMatches(poi, notes) {
  const noteTerms = parseInterestInput(notes);
  const haystack = `${poi.category || ""} ${poi.categoryLabel || ""} ${poi.name || ""} ${poi.tagSummary || ""}`.toLowerCase();

  return noteTerms.filter((term) => term.length > 2 && haystack.includes(term));
}

function deriveFreeSlots({ travelerMode, freeSlots, availableMinutes }) {
  if (Array.isArray(freeSlots) && freeSlots.length > 0) {
    return freeSlots;
  }

  const minutes = Number(availableMinutes) || (travelerMode === "business" ? 120 : 180);

  return buildFreeSlots([], {
    dayStart: "09:00",
    dayEnd: minutesToClockLabel(parseTimeToMinutes("09:00") + minutes),
  });
}

function computeInterestMatches(poi, interests) {
  const haystack = `${poi.name || ""} ${poi.categoryLabel || ""} ${poi.tagSummary || ""}`.toLowerCase();
  const directMatches = parseInterestInput(interests).filter((interest) => haystack.includes(interest));
  const categoryMatches = getInterestCategoryMatches(poi, interests);

  return Array.from(new Set([...directMatches, ...categoryMatches]));
}

function optimizeCandidatePlaces({ pois, travelerMode, interests, freeSlots, notes = "", limit = 10 }) {
  const interestTerms = parseInterestInput(interests);
  const maxUsefulMinutes = Math.max(...freeSlots.map((slot) => slot.durationMinutes), 90);
  const clusterCounts = new Map();

  return pois
    .filter((poi) => Number.isFinite(Number(poi?.lat)) && Number.isFinite(Number(poi?.lng)))
    .map((poi) => {
      const interestMatches = computeInterestMatches(poi, interestTerms);
      const noteMatches = getNoteMatches(poi, notes);
      const lat = Number(poi.lat);
      const lng = Number(poi.lng);
      const travelToleranceDivisor = maxUsefulMinutes >= 300 ? 35 : maxUsefulMinutes >= 180 ? 28 : 20;
      const accessibilityScore = Math.max(0, 3 - (poi.travelMinutes || 0) / travelToleranceDivisor);
      const fitScore = poi.visitDurationMinutes <= maxUsefulMinutes ? 1.5 : 0.4;
      const modeBonus =
        travelerMode === "business" && poi.category === "cafe"
          ? 0.8
          : travelerMode === "leisure" && (poi.category === "park" || poi.category === "viewpoint")
            ? 0.6
            : 0;
      const interestScore = interestMatches.length * 4.2;
      const noteScore = noteMatches.length * 2.2;
      const premiumInterestBonus =
        interestMatches.length > 0 && /museum|historic|gallery|park|viewpoint|restaurant|cafe/.test(poi.category)
          ? 1
          : 0;

      const score =
        poi.cultureWeight * 2.2 +
        interestScore +
        noteScore +
        accessibilityScore +
        fitScore +
        modeBonus +
        premiumInterestBonus;

      return {
        ...poi,
        lat,
        lng,
        interestMatches,
        noteMatches,
        score: Number(score.toFixed(2)),
        clusterKey: `${lat.toFixed(2)}-${lng.toFixed(2)}`,
      };
    })
    .sort((left, right) => right.score - left.score)
    .filter((poi) => {
      const current = clusterCounts.get(poi.clusterKey) || 0;

      if (current >= 2) {
        return false;
      }

      clusterCounts.set(poi.clusterKey, current + 1);
      return true;
    })
    .slice(0, limit);
}

function buildReason(poi, travelerMode) {
  if (poi.interestMatches?.length > 0) {
    return `Matches your interest in ${poi.interestMatches.join(", ")} while keeping transit light.`;
  }

  if (poi.noteMatches?.length > 0) {
    return `Fits the extra detail you provided around ${poi.noteMatches.join(", ")}.`;
  }

  if (travelerMode === "business") {
    return "Fits into a work-day break with realistic travel time and a strong local payoff.";
  }

  return "Offers a distinctive local stop without pushing the route too far from your current area.";
}

function buildDeterministicItinerary({
  travelerMode,
  location,
  interests,
  notes,
  freeSlots,
  shortlistedPois,
  rawPoiCount,
}) {
  const remainingPois = [...shortlistedPois];
  const timeline = [];

  freeSlots.forEach((slot) => {
    const slotStart = parseTimeToMinutes(slot.startTime);
    let cursor = slotStart;
    let remaining = slot.durationMinutes;
    const slotLimit = slot.durationMinutes >= 180 ? 2 : 1;
    let added = 0;

    while (remainingPois.length > 0 && remaining > 40 && added < slotLimit) {
      const poi = remainingPois.shift();
      const travelMinutes = Math.min(poi.travelMinutes || 12, Math.max(6, Math.floor(remaining / 3)));
      const stayMinutes = Math.min(poi.visitDurationMinutes || 45, remaining - travelMinutes);

      if (stayMinutes < 25) {
        continue;
      }

      const startMinutes = cursor + travelMinutes;
      const endMinutes = startMinutes + stayMinutes;

      timeline.push({
        id: `${slot.id}-${poi.id}`,
        slotId: slot.id,
        placeId: poi.id,
        title: poi.name,
        category: poi.categoryLabel,
        startTime: minutesToClockLabel(startMinutes),
        endTime: minutesToClockLabel(endMinutes),
        durationMinutes: stayMinutes,
        travelMinutes,
        distanceMeters: poi.distanceMeters || null,
        score: poi.score,
        reason: buildReason(poi, travelerMode),
        highlight: `${poi.categoryLabel} stop with ${travelMinutes} min transit`,
        place: poi,
      });

      cursor = endMinutes;
      remaining = slotStart + slot.durationMinutes - cursor;
      added += 1;
    }
  });

  const mapPoints = timeline.map((item, index) => ({
    id: item.placeId,
    order: index + 1,
    title: item.title,
    lat: item.place.lat,
    lng: item.place.lng,
    category: item.category,
    startTime: item.startTime,
    endTime: item.endTime,
    reason: item.reason,
  }));

  return {
    headline:
      travelerMode === "business"
        ? "Workday windows turned into a realistic city plan"
        : "A nearby city plan tuned to your current context",
    overview:
      timeline.length > 0
        ? `This itinerary balances cultural value, proximity, and your available time across ${freeSlots.length} open window${freeSlots.length > 1 ? "s" : ""}.`
        : "No strong nearby candidates fit the current timing, so the dashboard is holding a lightweight recommendation set for manual refinement.",
    travelerMode,
    location,
    interests,
    notes,
    freeSlots,
    timeline,
    mapPoints,
    shortlistedPois,
    stats: {
      rawPoiCount,
      selectedPoiCount: mapPoints.length,
      totalTravelMinutes: timeline.reduce((sum, item) => sum + item.travelMinutes, 0),
      totalVisitMinutes: timeline.reduce((sum, item) => sum + item.durationMinutes, 0),
    },
    tips: [
      "Favor the first stop if your available time shrinks unexpectedly.",
      "Use the map to compare proximity before committing to a second stop.",
      "Cultural sites were weighted above generic attractions in this pass.",
    ],
  };
}

module.exports = {
  buildDeterministicItinerary,
  deriveFreeSlots,
  getNoteMatches,
  optimizeCandidatePlaces,
};
