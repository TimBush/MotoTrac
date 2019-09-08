// ROUTING FOR INDEX PAGE => /

const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  res.send("homepage");
});

module.exports = router;
