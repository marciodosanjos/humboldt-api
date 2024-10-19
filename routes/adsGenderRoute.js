const express = require("express");
const fetchAdsGenderData = require("../controllers/adsGenderCtrl.js");

const adsGenderRouter = express.Router();

adsGenderRouter.get("/", fetchAdsGenderData);

module.exports = adsGenderRouter;
