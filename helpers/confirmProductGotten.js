const errorGenerator = require("./errorGenerator");

/**
 *
 * @param {string} productName - The product name returned from cheerio
 * @param {string} website - The name of the website we're trying to find a product for
 * @returns An Error if there is no product name
 */
module.exports = (productName, website) => {
  if (productName === "") {
    throw errorGenerator(
      404,
      `The given URL doesn't match a ${website} product`
    );
  }
};
