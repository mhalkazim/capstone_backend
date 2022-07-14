/*
 * Import the libraries
 * -----------------------------------------------------------------------------
 */
// Import the express function
const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Import express-form-data to process HTTP Post requests
const expressFormData = require('express-form-data');

const cors = require('cors');
require('dotenv').config();
const db_url = process.env.DB_URL;

const UserModel = require('./models/UserModel');

// importing custom routes from routes folder (add all routes here)
const ProductRoutes = require("./routes/ProductRoutes.js");
const UserRoutes = require("./routes/UserRoutes.js");

// Calling the express function will return an object
// with all of the methods for handling HTTP
const server = express();

// --------- Start of PassportJS configuration ---------
// Use passport, passport-jwt to read the client jwt
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtSecret = process.env.JWT_SECRET;

const passportJwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
}

// This function will tell passport how what to do
// with the payload.
const passportJwt = (passport) => {
  passport.use(
      new JwtStrategy(
          passportJwtOptions,
          (jwtPayload, done) => {

              // Tell passport what to do with payload
              UserModel
              .findOne({ _id: jwtPayload._id })
              .then(
                  (dbDocument) => {
                      // The done() function will pass the 
                      // dbDocument to Express. The user's 
                      // document can then be access via req.user
                      return done(null, dbDocument)
                  }
              )
              .catch(
                  (err) => {
                      // If the _id or anything is invalid,
                      // pass 'null' to Express.
                      if(err) {
                          console.log(err);
                      }
                      return done(null, null)
                  }
              )

          }
      )
  )
};
passportJwt(passport)
// ---------End of Passport JS configuration ---------

const cloudinary = require('cloudinary').v2;

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
)

// configuration for body-parser to handle post requests
// no need to install a seperate package - its built in
// const bodyParserConfig = {extended: false};
// server.use( bodyParser.urlencoded(bodyParserConfig) )
// server.use( bodyParser.json() );
server.use(expressFormData.parse());
server.use( cors() )
server.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Connect to MongoDB via mongoose
db_config = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose
.connect(db_url, db_config)                         // Try to connect to MongoDB
.then(                                              // If successful, then console.log()
    function() {    
        console.log("DB is connected")
    }
)
.catch(                                             // If not successful, catch the error
    function(dbError) {
        console.log('db error', dbError)
    }
);

/*
 * Create the routes
 * -----------------------------------------------------------------------------
 */
// Example route


// adding an index / landing page route to server
server.get(
  "/", 
  function (req, res) {
    res.send("<h1>You have successfully landed on the Dubai Marketplace!</h1>");
  }
);

// using the routes we created from routes folder
server.use(
  "/product", 
  ProductRoutes
  );

server.use(
  "/user", 
  UserRoutes
  );

// this is for testing that post requests are made successfully.
// Should be deleted once all routes and testing completed
server.post("/name", function (req, res) {
  const userDetails = {
    name: req.body.name,
    age: req.body.age,
  };
  res.send(
    `Welcome to the User page\n Your details are as follow\n name:${userDetails.name} and age: ${userDetails.age}`
  );
});

// server is listening to requests on port 3011
server.listen(
  process.env.PORT || 3011, 
  function () {
    console.log("Server is running and listening on port 3011");
  }
);
