const express = require("express");
const router = express.Router();
const ProductModel = require("../models/ProductModel.js");

// all routes need to go here GET/POST

// this the browse listing route where all proudct listings will be viewable
router.get("/", function (req, res) {
  res.send("You have landed on Products browse page");
});

// this is where the user goes to list a product
router.post("/list", function (req, res) {
  const newEntry = {
    category: req.body.category,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  };
  ProductModel.findOne({name: newEntry.name})
  .then((dbDocument)=>{if(!dbDocument){ProductModel.create(newEntry)
    .then((response) => {if(response){res.json({"status": "ok", "message": {"category": response.category, "name": response.name, "description": response.description, "price": response.price}})}})
    .catch((error) => res.status(503).json({"status": "not ok", "message": "Something went wrong with DB"}));}})
  .catch(res.status(401).json({"status": "not ok", "message" : "Product name is unavaliable"}))
  // res.send(newEntry);

  
});

// this where a user goes to update their product listing
// logic here needs to change to some sort of lookup and update
router.post("/update", function (req, res) {
  const newDocument = {
    oldname : req.body.oldname,
    category: req.body.category,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
  };
  // placeholder for now
  ProductModel.findOne({name: newDocument.oldname})
    .then((response) => {if(response){
      response.name = newDocument.name
      response.category = newDocument.category 
      response.description = newDocument.description
      response.price = newDocument.price
      res.json({"status": "ok", "message": {"category": response.category, "name": response.name, "description": response.description, "price": response.price}})}})
    .catch((error) => res.status(503).json({"status": "not ok", "message": "Something went wrong with DB"}));
  // res.send(newEntry);
});

// end of all routes

// export statement so that it can be imported in server.js
module.exports = router;