/**
 * If no route is found by any previous routing modules, this route kicks in
 * to respond with 404
 */

const express = require("express");
const router = express.Router();

// If no route is found by any previous routing module above, this route kicks in
router.get("/*", (req, res) => {
  res.json({
    errorStatus: 404,
    errorMessage: "OOPS! We couldn't find what you're looking for"
  });
});

module.exports = router;
