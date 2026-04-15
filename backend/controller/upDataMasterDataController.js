const express = require("express");
const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const { Sequelize, Op } = require("sequelize");


const upDataMasterDataController = asyncHandler(async (req, res) => {
    console.log(req.query)
  console.log("The sdas")
});

module.exports = { upDataMasterDataController };