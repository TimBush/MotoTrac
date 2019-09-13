const express = require("express");

const app = express();

const errorMiddleware = require("./middleware/errorHandler");

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server Started - Listening on port ${port} `);
});

app.set("view engine", "pug");

require("./startup/routes")(app);

// Catch-all error Handler
app.use(errorMiddleware);
