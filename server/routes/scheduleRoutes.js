const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
const { extractSchedule } = require("../controllers/scheduleController");

const router = express.Router();

router.post("/", upload.single("schedulePdf"), extractSchedule);

module.exports = router;
