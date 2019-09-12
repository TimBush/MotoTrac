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
