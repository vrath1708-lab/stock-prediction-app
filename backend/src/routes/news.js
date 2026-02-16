const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");

router.get("/:symbol", newsController.getNews);

module.exports = router;
