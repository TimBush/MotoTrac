const axios = require("axios");
const cheerio = require("cheerio");

// Used for creating error obj, that can be them thrown
const errorGenerator = require("../helpers/errorGenerator");
// Used to confirm product information was scrapped
const confirmProductGotten = require("../helpers/confirmProductGotten");

/**
 * The purpose of this class is to gather all product information
 * from a J&P Cycles URL - name, price, size, etc.
 * We do this through a list of useful "private" (not currently set to private) methods
 * This class has 3 main entry points that will provide product information
 * depending on the category specified
 */
class JPCyclesScraper {
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
      await this.makeHttpRequest(productUrl);

      // Axios will typically make a request for a webpage, even if
      // The client puts in the wrong URL, this f() call is an added
      // Layer to confirm we did get a particular product
      confirmProductGotten(this.productName(), "J&P Cycles");

      const productName = this.productName();
      const price = this.price();
      const productSizes = this.productSizes();
      const reviewInformation = this.productReviewInformation();
      const productColors = this.productColors();
      const productImages = this.productImage();

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
      await this.makeHttpRequest(productUrl);

      // Axios will typically make a request for a webpage, even if
      // The client puts in the wrong URL, this f() call is an added
      // Layer to confirm we did get a particular product
      confirmProductGotten(this.productName(), "J&P Cycles");

      const productName = this.productName();
      const price = this.price(true);
      const reviewInformation = this.productReviewInformation();
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
      await this.makeHttpRequest(productUrl);

      // Axios will typically make a request for a webpage, even if
      // The client puts in the wrong URL, this f() call is an added
      // Layer to confirm we did get a particular product
      confirmProductGotten(this.productName(), "J&P Cycles");

      const productName = this.productName();
      const price = this.price();
      const tireSize = this.tireSize();
      const tireLocation = this.tireLocation();
      const reviewInformation = this.productReviewInformation();
      const productImages = this.productImage();

      return {
        productName,
        price,
        tireSize,
        tireLocation,
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
   * @returns the name of the product as a string
   */
  productName() {
    const $ = cheerio.load(this.response.data);

    const productNameElement = "div.product-name > h1";

    return $(productNameElement)
      .text()
      .trim();
  }

  /**
   * @param {boolean} isPart Denotes whether we are calling this f() for a part
   * @returns a price object for the price of the product(s)
   */
  price(isPart) {
    const $ = cheerio.load(this.response.data);

    const productPriceElement = "div.total-price > span";
    const fitmentButton = "button.fitment-button";

    const productPrice = $(productPriceElement).text();

    // We need to adjust pricing if this is a part & we
    // also need to confirm if there is a button on the page to select the type
    // of motorcycle, bc pricing will sometimes vary based on vehicle
    if (isPart && fitmentButton) {
      const pricing = {
        minPrice: productPrice,
        priceMayVaryBasedOnVehicle: true
      };

      return pricing;
    }

    return {
      minPrice: productPrice
    };
  }

  /**
   * @returns an array of product sizes
   */
  productSizes() {
    const $ = cheerio.load(this.response.data);

    const sizeElementName = "select#productSkuSelector";
    let productSizes = [];

    $(sizeElementName)
      .children("option")
      .each((i, elem) => {
        const elementsText = $(elem).text();

        // 'Select a Size' is typically the first option, we need to remove it
        if (elementsText !== "Select a Size:") {
          // JPCycles Sizes include the price, we need to remove that.
          const justSizeText = elementsText.slice(0, 3).trim();

          // If the size is only 1 char, a '-' will be in the str
          // If it is, we need to get it out and return only the sizes chars
          if (justSizeText.includes("-")) {
            const twoCharSize = justSizeText.slice(0, 2).trim();
            productSizes.push(twoCharSize);
          } else {
            productSizes.push(justSizeText);
          }
        }
      });

    return productSizes;
  }

  /**
   * @returns an object with the review/rating information
   */
  productReviewInformation() {
    const $ = cheerio.load(this.response.data);

    const ratingElement = "div.show-inline-block.align-middle";
    const totalReviewsElement = "span.total-reviews";
    // Intialize rating to 0.  JPCycles uses stars to track rating, not int
    let rating = 0;

    // We don't want to return a 0 rating alone, as it would be misleading
    // If there's no reviews, we want to let the client now
    if ($(totalReviewsElement).html() === null) {
      return {
        rating,
        totalReviews: "There are no reviews for this product"
      };
    }

    $(ratingElement)
      .children("span")
      .each((i, elem) => {
        // Check to see if a star is turned on
        // JPCycles doesn't use int.  They toggle rating-start-on/off
        if ($(elem).hasClass("rating-star-on")) {
          rating += 1;
        }
      });

    return {
      rating,
      totalReviews: parseInt($(totalReviewsElement).text())
    };
  }

  /**
   * Depending on what color information is provided by J&P
   * This method will return and obj with different props
   * @returns an object with product color information
   */
  productColors() {
    const $ = cheerio.load(this.response.data);

    const colorElement = "div.spec-details > span.spec-productcolor";
    const graphicElement = "div.spec-details > span.spec-graphicname";

    const productColors = {};

    if ($(graphicElement).html() !== null) {
      productColors.color = $(colorElement).text();
      productColors.graphicName = $(graphicElement).text();
      productColors.colorIsGraphic = true;
    } else {
      productColors.color = $(colorElement).text();
      productColors.colorIsSolid = true;
    }

    return productColors;
  }

  /**
   * @returns an object with either main or secondary images of the product
   */
  productImage() {
    const $ = cheerio.load(this.response.data);

    const imgElement = "div#main-product-image";

    const mainProductImage = $(imgElement)
      .children("img")
      .first()
      .attr("src");
    const secondaryProductImagesArr = $(imgElement)
      .children("img")
      .first()
      .nextAll("img");

    const secondaryProductImages = [];

    // We are preparing for the case that a product has only a mainProductImage
    // If it doesn't, we need to get the secondaryImages
    if (secondaryProductImagesArr.length !== 0) {
      $(imgElement)
        .children("img")
        .first()
        .nextAll("img")
        .each((i, elem) => {
          const secondaryImageUrl = $(elem).data("src");
          secondaryProductImages.push(secondaryImageUrl);
        });

      return {
        mainProductImage,
        secondaryProductImages
      };
    }

    return {
      mainProductImage
    };
  }

  /**
   * @returns a string of the tire size
   */
  tireSize() {
    const $ = cheerio.load(this.response.data);

    const tireSizeElement = "span.spec-tiresize";

    return $(tireSizeElement).text();
  }

  /**
   * @returns a string of the avaialable tire location
   */
  tireLocation() {
    const $ = cheerio.load(this.response.data);

    const tireLocationElement = "span.spec-position";

    return $(tireLocationElement).text();
  }

  /**
   * EXPERIMENTAL
   * May be released in future version
   */
  productVideo() {
    const $ = cheerio.load(this.response.data);

    const videoPlayerElement = "div.youtube";

    return $(videoPlayerElement)
      .last()
      .children("a")
      .attr("href");
  }
}

module.exports.jpcyclesScraper = new JPCyclesScraper();
