const express = require('express');
const logger = require("morgan");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

//MongoDB config
require("./loaders/db");

// middleware
app.use(express.json());
app.use(logger("dev"));


app.use("/api", apiRoutes);

app.listen(process.env.PORT,() => {
    console.log(`Server is running on port ${process.env.PORT}.`);
  });
