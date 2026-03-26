const { getAuth } = require("@clerk/express");

function requireUser(req, res, next) {
  const auth = getAuth(req);

  if (!auth.userId) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  req.auth = auth;
  return next();
}

module.exports = {
  requireUser,
};
