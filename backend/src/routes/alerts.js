const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getSettings,
  updateSettings,
  muteAlerts,
  processAlerts,
} = require("../controllers/alertController");

router.get("/settings", auth, getSettings);
router.put("/settings", auth, updateSettings);
router.post("/mute", auth, muteAlerts);
router.post("/process", processAlerts);

module.exports = router;
