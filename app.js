const express = require('express');
const logger = require("morgan");
var cors = require('cors');
const apiRoutes = require("./src/routes/apiRoutes");

const app = express();

//MongoDB config
require("./src/loaders/db");

// middleware
app.use(express.json());
app.use(logger("dev"));
app.use(cors());

app.use("/api", apiRoutes);

app.listen(process.env.PORT,() => {
    console.log(`Server is running on port ${process.env.PORT}.`);
  });
