const axios = require("axios");
const cheerio = require("cheerio");

const errorGenerator = require("../helpers/errorGenerator");
const confirmProductGotten = require("../helpers/confirmProductGotten");

/**
 * The purpose of this class is to gather all product information
 * from a Revzilla URL - name, price, size, etc.
 * We do this through a list of useful "private" (not currently set to private) methods
 * This class has 3 main entry points that will provide product information
 * depending on the category specified
 */
class RevzillaScraper {
  constructor(response) {
    this.response = response;
  }

  /**
   * Make an http request to a given product URL. It stores this response in this.response
   * @param {string} productUrl The URL of the page we want to scrape
   */
  async makeHttpRequest(productUrl) {
    try {
      const response = await axios.get(productUrl);
      this.response = response;
    } catch (err) {
      throw errorGenerator(404, "The URL entered couldn't be found");
    }
  }

  /**
   * Main entry point for gathering all product information related to apparel
   * @param {string} productUrl The URL of the page we want to scrape
   */
  async allApparelInfo(productUrl) {
    try {
      // Make HTTP request to the given web page
      await this.makeHttpRequest(productUrl);

      // Axios will typically make a request for a webpage, even if
      // The client puts in the wrong URL, this IF is an added
      // Layer to confirm we did get a particular product
      confirmProductGotten(this.productName(), "Revzilla");

      // Gather all product information specific to apparel
      const productName = this.productName();
      const productSizes = this.productSizes();
      const price = this.price();
      const reviewInformation = this.productRating();
      const productImages = this.productImage();
      const productColors = this.productVariations();

      return {
        productName,
        productSizes,
        productColors,
        price,
        reviewInformation,
        productImages
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Main entry point for gathering all product information related to parts
   * @param {string} productUrl The URL of the page we want to scrape
   */
  async allPartInfo(productUrl) {
    try {
      // Make HTTP request to the given web page
      await this.makeHttpRequest(productUrl);

      // Axios will typically make a request for a webpage, even if
      // The client puts in the wrong URL, this IF is an added
      // Layer to confirm we did get a particular product
      confirmProductGotten(this.productName(), "Revzilla");

      // Gather all product information
      const productName = this.productName();
      const price = this.price(true);
      const reviewInformation = this.productRating();
      const productImages = this.productImage();

      return {
        productName,
        price,
        reviewInformation,
        productImages
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * Main entry point for gathering all product information related to tires
   * @param {string} productUrl The URL of the page we want to scrape
   */
  async allTireInfo(productUrl) {
    try {
      // Make HTTP request to the given web page
      await this.makeHttpRequest(productUrl);

      // Axios will typically make a request for a webpage, even if
      // The client puts in the wrong URL, this IF is an added
      // Layer to confirm we did get a particular product
      confirmProductGotten(this.productName(), "Revzilla");

      // Gather all product information
      const productName = this.productName();
      const price = this.price();
      const tireSizes = this.productSizes();
      const tireLocations = this.productVariations();
      const reviewInformation = this.productRating();
      const productImages = this.productImage();

      return {
        productName,
        tireSizes,
        tireLocations,
        price,
        reviewInformation,
        productImages
      };
    } catch (err) {
      throw err;
    }
  }

  /**
   * ALL FUNCTIONS BELOW THIS POINT ARE HELPER METHODS
   * THEY CAN ALSO BE LOOKED AT AS PRIVATE METHODS
   */

  /**
   * @param {boolean} isPart Denotes whether we are calling this f() for a part
   * @returns a price object for the price of the product(s)
   */
  price(isPart) {
    const $ = cheerio.load(this.response.data);

    // Target the pricing element on the page
    const priceElements = "span.mny";
    // Target the first and last pricing elements on the page & get their text
    const firstPriceText = $(priceElements)
      .first()
      .text();
    const lastPriceText = $(priceElements)
      .last()
      .text();

    // We need to see if the first pricing elem is not the same as the second
    // if it's not we know that there is a price range for this product that
    // is typically dependent on the size the client picks
    // *note price can also vary depending on color (i.e helmet face shields)
    // If they are the same, we know the price is fixed no matter the size
    if (firstPriceText !== lastPriceText) {
      const pricing = {
        minPrice: firstPriceText,
        maxPrice: lastPriceText,
        priceDependentOnVersionChosen: true
      };

      // If isPart was set to true we want to change the pricing obj
      // so that a different pricing key is denoted
      if (isPart) {
        delete pricing.priceDependentOnVersionChosen;
        pricing.priceIsDependentOnVehicle = true;
      }

      return pricing;
    }

    return {
      minPrice: firstPriceText
    };
  }

  /**
   * @returns the name of the product as a string
   */
  productName() {
    const $ = cheerio.load(this.response.data);

    const productName = $(".product-show-details-name__name")
      .text()
      .trim();

    return productName;
  }

  /**
   * @returns an object with the main image of the product
   */
  productImage() {
    const $ = cheerio.load(this.response.data);

    const imgElement = "img.product-show-media-image__image";

    const mainProductImage = $(imgElement).attr("src");

    return {
      mainProductImage
    };
  }

  /**
   * @returns an array of product sizes
   */
  productSizes() {
    const $ = cheerio.load(this.response.data);
    let productSizes = [];

    const selectSizeElement = ".option-type__select";

    // If there is only 1 selectSizeElement on the page
    // We can assume that no size selection is available
    // In this case we default to 'One Size'
    if ($(selectSizeElement).get().length === 1) {
      productSizes.push("One Size");
      return productSizes;
    }

    $(selectSizeElement)
      .last()
      .children("option")
      .each((i, elem) => {
        const currentElementText = $(elem).text();

        if (
          currentElementText !== "Select Size" &&
          currentElementText !== "Select Tire Size"
        ) {
          productSizes.push(currentElementText);
        }
      });

    return productSizes;
  }

  /**
   * Get available product variations
   * With Revzilla it's typically color or wheel location
   * @returns an array of product color(s) or wheel location(s)
   */
  productVariations() {
    const $ = cheerio.load(this.response.data);
    let productVariations = [];

    const selectVariationElement = ".option-type__select";

    $(selectVariationElement)
      .first()
      .children("option")
      .each((i, elem) => {
        const currentElementText = $(elem).text();

        // We need this to filter out colors
        // If this block is skipped we assume the product is a tire
        if (
          currentElementText !== "Select Color" &&
          currentElementText !== "Select Wheel Location"
        ) {
          productVariations.push(currentElementText);
        }
      });
    return productVariations;
  }

  /**
   * @returns an object with the review/rating information
   */
  productRating() {
    const $ = cheerio.load(this.response.data);

    const ratingElement = "div.product-show-details-ugc__rating-stars";
    const totalReviewsElement = "div.product-show-section__tab-header > span";

    const rating = $(ratingElement).data("rating");
    const totalReviews = parseInt($(totalReviewsElement).html());

    // We need to make sure there are reviews for this product
    // returning a rating of 0 & reviews as 0 us somewhat misleading; lacks context
    if (totalReviews !== 0) {
      return {
        rating,
        totalReviews
      };
    }

    return {
      rating: "There are no ratings for this product",
      totalReviews: "There are no reviews for this product"
    };
  }

  /**
   * EXPERIMENTAL
   * May be released in future version
   */
  productVideo() {
    const $ = cheerio.load(this.response.data);

    const videoElement = "div.product-show-media-video__embed";

    // Default response if no videoUrl is found
    // This will get overridden if a videoUrl is found
    let videoUrl = "There is no video associated with this product";

    $(videoElement)
      .children("meta")
      .each((i, elem) => {
        if ($(elem).attr("itemprop") === "contentURL") {
          videoUrl = $(elem).attr("content");
          return;
        }
      });

    return videoUrl;
  }
}

module.exports.RevScraper = RevzillaScraper;
