require('dotenv').config();
const express = require("express");
const routes = require("./routes");

const app = express();

app.use(express.json());

app.use(routes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
