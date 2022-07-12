const express = require("express");
const router = express.Router();

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const UserModel = require('../models/UserModel.js');


// all routes need to go here GET/POST

router.get(
  "/", 
  function (req, res) {
    res.send("You landed on User route");
  }
);

// Regsitration Route
router.post(
  '/registration',
  async function(req,res) {
    
    const newDocument = {
      'firstname': req.body.firstname,
      'lastname': req.body.lastname,
      'email': req.body.email,
      'password': req.body.password,
      'phonenumber' : req.body.phonenumber,
      'address' : req.body.address
    } 

    // 1a.  If email is unique
    const dbResult = await UserModel.findOne({email: req.body.email});
    if (dbResult === null) {
      // 2. Generate a hash
      const salt = await bcryptjs.genSalt();
      const hashedPassword = await bcryptjs.hash(req.body.password, salt);

      // 3. Replace the original password with hash
      newDocument.password = hashedPassword;
    
      // 4. Write credentials in collection
      UserModel
      .create(newDocument)
      .then(                                      // If the 'create' request is successful, then handle it
          function(dbDocument) {
              res.json( dbDocument );
          }
      )
      .catch(
          function(dbError) {                     // If the 'create' request is unsuccessful, catch the error
              console.log(dbError);
              res.send("An error occured");
          }
      );
    }
    // 1b.  If email is NOT unique
    else {
      // 2. Reject the request
      res.send(
          {
              "message": "not ok",
              "description": "An account already exists"
          }
      );
   }
  }
)

// Login Route
router.post(
  '/login',
  (req, res) => {
    // Capture form data
    const formData = {
      email: req.body.email,
      password: req.body.password,
    }

    // Check if email exists
    UserModel
    .findOne({ email: formData.email })
    .then(
      (dbDocument) => {
        // If email exists
        if(dbDocument) {
          // Compare the password sent against password in database
          bcryptjs.compare(
            formData.password,          // password user sent
            dbDocument.password         // password in database
            )
            .then(
              (isMatch) => {
                // If passwords match...
                if(isMatch) {
                  // Generate the Payload
                  const payload = {
                    _id: dbDocument._id,
                    email: dbDocument.email
                  }
                  // Generate the jsonwebtoken
                  jwt
                  .sign(
                    payload,
                    jwtSecret,
                    (err, jsonwebtoken) => {
                      if(err) {
                        console.log(err);
                        res.status(501).json(
                          {
                            "message": "Something went wrong"
                          }
                        );
                      }
                      else {
                        // Send the jsonwebtoken to the client
                        res.json(
                          {
                            "message": {
                              email: dbDocument.email,
                              firstName: dbDocument.firstname,
                              lastName: dbDocument.lastname,
                              jsonwebtoken: jsonwebtoken
                            }
                          }
                        );
                      }
                    }
                  )
                }
                // If passwords don't match, reject login
                else {
                  res.status(401).json(
                    {
                      "message": "Wrong email or password"
                    }
                  );
                }
              }
            )
            .catch(
              (err) => {
                console.log(err)
              }
            )
        }
        // If email does not exist
        else {
          // reject the login
          res.status(401).json(
            {
              "message": "Wrong email or password"
            }
          );
        }
      }
    )
    .catch(
        (err) => {
            console.log(err);

            res.status(503).json(
                {
                    "status": "not ok",
                    "message": "Please try again later"
                }
            );
        }
    )

  }
)

// Update Route
router.post(
  '/update',
  async (req,res) => {
    // Get the updated data

    const currentData = {
      'email': req.body.currentEmail,
      'password': req.body.currentPassword
    }
    const newData = {
      'firstname': req.body.firstname,
      'lastname': req.body.lastname,
      'email': req.body.email,
      'password': req.body.password,
      'phonenumber' : req.body.phonenumber,
      'address' : req.body.address
    }

    if(newData.password){
      const salt = await bcryptjs.genSalt();
      const hashedPassword = await bcryptjs.hash(req.body.password, salt);

      // 3. Replace the original password with hash
      newData.password = hashedPassword;
    }
    
    UserModel
    .findOneAndUpdate({email: currentData.email}, newData, {new:true})
    .then(
      (dbDocument) => {
        if(dbDocument){
          res.json(
            {
              "message":{
                email: dbDocument.email,
                firstname: dbDocument.firstname,
                lastname: dbDocument.lastname,
                address: dbDocument.address,
                phonenumber: dbDocument.phonenumber,
                password: dbDocument.password
              }
            }
          )
        }
        else{
          res.status(401).json(
            {
                "message": "Wrong email or password"
            }
        );
        }
      }
    )
    .catch(
      (err)=>{
        console.log(err);
        
        res.status(503).json(
          {
            "status" : "not ok",
            "message": "Please try again later"
          }
        )
      }
    )
 
  }

);

// end of all routes

// export statement so that it can be imported in server.js

module.exports = router;
