/*
 * The point of this class is to assist in scraping Revzilla
 * We can scrap for apparel, parts, & tires
 * We then compile all the information and return it in a obj
 */

const axios = require("axios");
const cheerio = require("cheerio");

const errorHandler = require("../helpers/errorResponses");

/*
 * The purpose of this class is to gather all product information
 * from Revzilla - name, price, size, etc.
 */
class RevzillaScraper {
  constructor(response) {
    this.response = response;
  }

  /*
   * The purpose of this f() is to make an http request
   * to a given product URL.  It stores this response in this.response
   */
  async makeHttpRequest(productUrl) {
    try {
      const response = await axios.get(productUrl);
      this.response = response;
    } catch (err) {
      console.log(err.response.status);
      // throw the err sent from axios
      throw err;
    }
  }

  /*
   * The purpose of this f() is to get a given
   * produts price
   * @param isPart - Boolean - Specifies if we're looking for the price of a part or apparel
   * @returns obj - product price
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
    // If they are the same, we know the price is fixed no matter the size
    if (firstPriceText !== lastPriceText) {
      const pricing = {
        minPrice: firstPriceText,
        maxPrice: lastPriceText,
        priceDependentOnSize: true
      };

      // If is part was set to true we want to change the pricing obj
      // so that a different pricing key is denoted
      if (isPart) {
        delete pricing.priceDependentOnSize;
        pricing.priceIsDependentOnVehicle = true;
      }

      return pricing;
    }

    return {
      minPrice: firstPriceText
    };
  }

  /*
   * The purpose of this f() is to get a given
   * produts name
   * @returns string - the product name
   */
  productName() {
    const $ = cheerio.load(this.response.data);

    const productName = $(".product-show-details-name__name")
      .text()
      .trim();

    return productName;
  }

  /*
   * Get the product image for a product
   * @returns string - the product image source link
   */
  productImage() {
    const $ = cheerio.load(this.response.data);

    const imgElement = "img.product-show-media-image__image";

    const mainProductImage = $(imgElement).attr("src");

    return {
      mainProductImage
    };
  }

  /*
   * The purpose of this f() is to get available product sizes
   * @returns array - the product sizes
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

  /*
   * The purpose of this f() is to get available product variations
   * With Revzilla it's typically color or wheel location
   * @returns array - the product color(s) or wheel location(s)
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

  /*
   * The purpose of this f() is to get the product rating
   * @returns int - the product rating
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

  /*
   * The purpose of this f() is to get all the product info
   * for APPAREL by calling all the information specific functions
   * and then return a compiled obj of all the products information
   * @returns obj - all the product information for apparel
   */
  async getAllApparelInfo(productUrl) {
    try {
      // Make HTTP request to the given web page
      await this.makeHttpRequest(productUrl);

      // Gather all product information specific to apparel
      const productName = this.productName();
      const productSizes = this.productSizes();
      const price = this.price();
      const reviewInformation = this.productRating();
      const imageSource = this.productImage();
      const productColors = this.productVariations();
      const videoSource = this.productVideo();

      return {
        productName,
        productSizes,
        productColors,
        price,
        reviewInformation,
        imageSource,
        videoSource
      };
    } catch (err) {
      return errorHandler(err.response.status);
    }
  }

  /*
   * The purpose of this f() is to get all the product info
   * for PARTS by calling all the information specific functions
   * and then return a compiled obj of all the products information
   * @returns obj - all the product information specific to parts
   */
  async getAllPartInfo(productUrl) {
    try {
      // Make HTTP request to the given web page
      await this.makeHttpRequest(productUrl);

      // Gather all product information
      const productName = this.productName();
      const price = this.price(true);
      const reviewInformation = this.productRating();
      const imageSource = this.productImage();

      return {
        productName,
        price,
        reviewInformation,
        imageSource
      };
    } catch (err) {
      return errorHandler(err.response.status);
    }
  }

  /*
   * The purpose of this f() is to get all the product info
   * for TIRES by calling all the information specific functions
   * and then return a compiled obj of all the products information
   * @returns obj - all the product information specific to tires
   */
  async getAllTireInfo(productUrl) {
    try {
      // Make HTTP request to the given web page
      await this.makeHttpRequest(productUrl);

      // Gather all product information
      const productName = this.productName();
      const price = this.price();
      const productSizes = this.productSizes();
      const productTireLocations = this.productVariations();
      const reviewInformation = this.productRating();
      const imageSource = this.productImage();

      return {
        productName,
        productSizes,
        productTireLocations,
        price,
        reviewInformation,
        imageSource
      };
    } catch (err) {
      return errorHandler(err.response.status);
    }
  }
}

module.exports.revzillaScraper = new RevzillaScraper();
