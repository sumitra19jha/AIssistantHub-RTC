const {
  rooms,
  logLevel
} = require("../constants");

const logger = require("../../logger");


exports.createRoom = async (req, res, next) => {
  console.log("CREATE ROOM CALLED");

  return res.json({
    success: true,
    message: "ROOM CREATION SUCCESS",
  });
}