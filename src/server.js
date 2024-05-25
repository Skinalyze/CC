const express = require("express");
const routes = require("./routes");

const app = express();

// Middleware untuk parsing JSON
app.use(express.json());

// Menggunakan routes
app.use(routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;