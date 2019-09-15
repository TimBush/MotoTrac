/**
 * This module is meant to control all the routes
 * By keeping them in one place, we give app.js a single point of entry
 * into the routes
 */

const home = require("../routes/index");
const products = require("../routes/product");
const error404 = require("../routes/404");

module.exports = app => {
  app.use("/", home);
  app.use("/product", products);

  // If no route is matched from any of the previous routers
  // We want to respond with a 404
  app.use("/*", error404);
};
