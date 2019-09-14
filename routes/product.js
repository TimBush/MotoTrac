// ROUTING FOR => /product

const express = require("express");

const router = express.Router();

const { RevScraper } = require("../services/revzillaScraper");
const { JpScraper } = require("../services/jpcyclesScraper");
const determineProduct = require("../helpers/determineProduct");

// Intialize new instances of each scraper for use in routing
const jpcyclesScraper = new JpScraper();
const revzillaScraper = new RevScraper();

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
