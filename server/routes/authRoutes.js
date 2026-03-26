const express = require("express");
const { clerkClient } = require("@clerk/express");
const { requireUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", requireUser, async (req, res, next) => {
  try {
    const { userId, sessionId } = req.auth;
    const user = await clerkClient.users.getUser(userId);

    res.json({
      authStatus: "authenticated",
      sessionId,
      user: {
        id: user.id,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(" "),
        primaryEmailAddress:
          user.emailAddresses.find(
            (email) => email.id === user.primaryEmailAddressId,
          )?.emailAddress || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
