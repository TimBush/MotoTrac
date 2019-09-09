const express = require("express");

const app = express();

const errorMiddleware = require("./middleware/errorHandler");

app.listen(3000, () => {
  console.log("Server Started");
});

app.set("view engine", "pug");

require("./startup/routes")(app);

// Catch-all error Handler
app.use(errorMiddleware);
