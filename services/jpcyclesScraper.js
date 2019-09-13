const axios = require("axios");
const cheerio = require("cheerio");

const errorGenerator = require("../helpers/errorGenerator");

class JPCyclesScraper {
  constructor(response) {
    this.response = response;
  }

  /*
   * Make an http request to a given product URL. It stores this response in this.response
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
   * Checks to see if a product name was returned after making an
   * http request to the given webpage
   * @returns An error specifying the given URL wasn't found
   */
  confirmProductPageWasScrapped() {
    if (this.productName() === "") {
      throw errorGenerator(
        404,
        "The given URL doesn't match a JPCycles Product"
      );
    }
  }

  async allApparelInfo(productUrl) {
    try {
      await this.makeHttpRequest(productUrl);

      // Axios will typically make a request for a webpage, even if
      // The client puts in the wrong URL, this f() call is an added
      // Layer to confirm we did get a particular product
      this.confirmProductPageWasScrapped();

      const productName = this.productName();
      const price = this.price();
      const productSizes = this.productSizes();
      const reviewInformation = this.productRating();
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

  productName() {
    const $ = cheerio.load(this.response.data);

    const productNameElement = "div.product-name > h1";

    return $(productNameElement)
      .text()
      .trim();
  }

  price() {
    const $ = cheerio.load(this.response.data);

    const productPriceElement = "div.total-price > span";

    const productPrice = $(productPriceElement).text();

    return {
      minPrice: productPrice
    };
  }

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

  productRating() {
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

  /*
   * This method is experimental w/ a planned future version release
   * Currently J&P lays out their videos in an inconsistent order depending
   * on the product and there is sometimes multiple videos associated w/
   * a single product
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
