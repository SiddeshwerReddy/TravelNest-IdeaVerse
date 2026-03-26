exports.extractSchedule = async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      error: "A PDF file is required in the schedulePdf field.",
    });
  }

  return res.status(501).json({
    message: "Schedule extraction scaffolded. Gemini and PDF parsing will be implemented next.",
    fileName: uploadedFile.originalname,
    nextStep:
      "Parse PDF text, extract meetings and preferences with Gemini, then compute free time slots.",
  });
};
