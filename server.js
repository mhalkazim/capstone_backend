// initializing server using express
const express = require("express");
const server = express();

// adding an index / landing page route to server
server.get("/", function (req, res) {
  res.send("<h1>You have successfully landed on the Dubai Marketpalce!</h1>");
});

// server is listening to requests on port 3000
server.listen(3000, function () {
  console.log("Server is running and listening on port 3000");
});
