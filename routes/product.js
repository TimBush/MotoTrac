// ROUTING FOR => /product

const express = require("express");

const router = express.Router();

const { revzillaScraper } = require("../services/revzillaScraper");
const { jpcyclesScraper } = require("../services/jpcyclesScraper");
const errorHandler = require("../helpers/errorResponses");

// NOTE - I could probably simplify this down to one GET route by adding :params in for apparel, parts, tires

// GET a specific products information
// REQUIRED => param - @PRODUCT - Category of product we're looking for (Apparel, Parts, Tires)
// REQUIRED => query - @URL - URL of product
router.get("/revzilla/:category", async (req, res) => {
  let productInfo = {};

  const typeOfProduct = req.params.category.toLowerCase();
  if (typeOfProduct === "apparel") {
    productInfo = await revzillaScraper.getAllApparelInfo(req.query.url);
  } else if (typeOfProduct === "parts") {
    productInfo = await revzillaScraper.getAllPartInfo(req.query.url);
  } else if (typeOfProduct === "tires") {
    productInfo = await revzillaScraper.getAllTireInfo(req.query.url);
  } else {
    productInfo = errorHandler(404, "That is not a valid <product> parameter");
  }

  res.json(productInfo);
});

router.get("/jpcycles", async (req, res) => {
  const productInfo = await jpcyclesScraper.allApparelInfo(req.query.url);

  res.json(productInfo);
});

module.exports = router;
