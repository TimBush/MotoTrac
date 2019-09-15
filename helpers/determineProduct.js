/**
 * The purpose of this module is to route the category specified in the param
 * through the correct Class method, so that we can get all the product information
 * It calls the correct scraper & scraper method and then returns
 * all the product info
 */

const errorGenerator = require("../helpers/errorGenerator");

/**
 *
 * @param {string} typeOfProduct - The category of product a client wants to scrape for
 * @param {string} scraperToUse - The website scraper Class instance to use
 * @param {string} queryUrl - The URL of the page we want to scrape
 * @returns An object with product information for the requested product
 */
module.exports = async (typeOfProduct, scraperToUse, queryUrl) => {
  try {
    let productInfo = {};

    if (typeOfProduct === "apparel") {
      productInfo = await scraperToUse.allApparelInfo(queryUrl);
    } else if (typeOfProduct === "parts") {
      productInfo = await scraperToUse.allPartInfo(queryUrl);
    } else if (typeOfProduct === "tires") {
      productInfo = await scraperToUse.allTireInfo(queryUrl);
    } else {
      throw errorGenerator(400, "That is not a valid <category> parameter");
    }

    return productInfo;
  } catch (err) {
    // Re-throw err to pass it up the chain
    throw err;
  }
};
