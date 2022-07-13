const express = require("express");
const router = express.Router();

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const cloudinary = require('cloudinary').v2;

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
    UserModel.findOne({email: req.body.email})
    .then(
      async function (dbDocument) {

        // If avatar file is included...
        if( Object.values(req.files).length > 0 ) {

            const files = Object.values(req.files);
            
            
            // upload to Cloudinary
            await cloudinary.uploader.upload(
                files[0].path,
                (cloudinaryErr, cloudinaryResult) => {
                    if(cloudinaryErr) {
                        console.log(cloudinaryErr);
                        res.json(
                            {
                                status: "not ok",
                                message: "Error occured during image upload"
                            }
                        )
                    } else {
                        // Include the image url in formData
                        newDocument.avatar = cloudinaryResult.url;
                        console.log('newDocument.avatar', newDocument.avatar)
                    }
                }
            )
        };
    
        if (!dbDocument) {
          // 2. Generate a hash
          bcryptjs.genSalt(

            function(bcryptError, theSalt) {
            // Use the (a) and (b) salt user's password 
            // and produce hashed password
              bcryptjs.hash( 
                newDocument.password,                  // first ingredient
                theSalt,                            // second ingredient
                function(hashError, theHash) {      // the hash
                  // Reassign the original password formData
                  newDocument['password'] = theHash;
                  console.log(newDocument.avatar)
                  // Create the user's account with hashed password
                  UserModel
                  .create(newDocument)
                  // If successful...
                  .then(
                    function(dbDocument) {
                      // Express sends this...
                      res.json({
                        status: "ok",
                        document: dbDocument
                      });
                    }
                  )
                  // If problem occurs, the catch the problem...
                  .catch(
                    function(dbError) {
                      // For the developer
                      console.log('An error occured during .create()', dbError);

                      // For the client (frontend app)
                      res.status(503).json(
                        {
                          "status": "not ok",
                          "message": "Something went wrong with db"
                        }
                      )
                    }
                  )
                }
              )
            }
          )

        }
        // If email is NOT unique....
        else { 
          // reject the request
          res.status(403).json(
            {
              "status": "not ok",
              "message": "Account already exists"
            }
          )
        }
      }
    )
    .catch(
      function(dbError) {

        // For the developer
        console.log(
          'An error occured', dbError
        );

        // For the client (frontend app)
        res.status(503).json(
          {
            "status": "not ok",
            "message": "Something went wrong with db"
          }
       )

      }
    )
  }
);


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
                              firstname: dbDocument.firstname,
                              lastname: dbDocument.lastname,
                              phonenumber: dbDocument.phonenumber,
                              address: dbDocument.address,
                              avatar: dbDocument.avatar,
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
                  console.log(formData.email)
                  console.log(formData.password)
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
          console.log(formData.email)
          console.log(formData.password)
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
  '/updatedata',
  async (req,res) => {
    // Get the updated data

    const currentData = {
      'email': req.body.email,
    }
    const newData = {
      'firstname': req.body.firstname,
      'lastname': req.body.lastname,
      'phonenumber' : req.body.phonenumber,
      'address' : req.body.address
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

router.post(
  '/changepassword',
  (req,res) => {
    // Get the updated data

    const currentData = {
      'email': req.body.email,
      'oldpassword': req.body.oldpassword,
    }
    const newData = {
      'password': req.body.newpassword
    }

  
    UserModel
    .findOne({email: currentData.email})
    .then(
      (dbDocument) => {
        if(dbDocument){
          bcryptjs.compare(
            currentData.oldpassword,
            dbDocument.password
            
          )
          .then(
            async (isMatch) =>{
              if(isMatch){
                const salt = await bcryptjs.genSalt();
                const hashedPassword = await bcryptjs.hash(req.body.newpassword, salt);
                newData.password = hashedPassword;

                dbDocument.password = newData.password
                dbDocument.save()
                res.json({
                  "status": "ok",
                  "message": {
                    "email": dbDocument.email,
                    "password": dbDocument.password
                  }
                })

              }
              else{
                res.status(503).json(
                  {
                    "status": "not ok",
                    "message": "Password is not matching"
                  }
              );
              }
            }
          )
        }
      }
    )
    .catch(
      (err) => {
      res.status(503).json(
        {
          "stauts": "not ok",
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
