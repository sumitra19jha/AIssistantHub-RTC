const {
  rooms,
  logLevel
} = require("../constants");

const logger = require("../../logger");
const {
  constants
} = require("fs/promises");


exports.createRoom = async (req, res, next) => {
  console.log(req.body);

  return res.json({
    success: true,
    message: "ROOM CREATION SUCCESS",
  });
}