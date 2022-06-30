// initializing server using express
const express = require("express");
const server = express();

// server is listening to requests on port 3000
server.listen(3000, function () {
  console.log("Server is running and listening on port 3000");
});
