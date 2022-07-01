const express = require("express");
const router = express.Router();

// all routes need to go here GET/POST

router.get(
  "/", 
  function (req, res) {
    res.send("You have landed on Product route");
  }
);


// end of all routes

// export statement so that it can be imported in server.js
module.exports = router;
