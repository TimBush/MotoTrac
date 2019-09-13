// ROUTING FOR => /product

const express = require("express");

const router = express.Router();

const { revzillaScraper } = require("../services/revzillaScraper");
const { jpcyclesScraper } = require("../services/jpcyclesScraper");
const errorGenerator = require("../helpers/errorGenerator");
const determineProduct = require("../helpers/determineProduct");

router.get("/revzilla/:category", async (req, res, next) => {
  try {
    // This gets us all of the products information
    const productInfo = await determineProduct(
      req.params.category.toLowerCase(),
      revzillaScraper,
      req.query.url
    );

    res.json(productInfo);
  } catch (err) {
    // Pass error to handler
    next(err);
  }
});

router.get("/jpcycles/:category", async (req, res, next) => {
  try {
    // This gets us all of the products information
    const productInfo = await determineProduct(
      req.params.category.toLowerCase(),
      jpcyclesScraper,
      req.query.url
    );

    res.json(productInfo);
  } catch (err) {
    // Pass error to handler
    next(err);
  }
});

module.exports = router;
