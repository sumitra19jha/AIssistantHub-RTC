const {
  rooms,
  logLevel
} = require("../constants");

const logger = require("../../logger");
const joinRoom = require("../socket/helpers/rooms")
const getSocketsOfUser = require("../socket/helpers/socketObject").getSocketsOfUser;


exports.createRoom = async (req, res, next) => {
  console.log("CREATE ROOM CALLED");
  const contentId = req.body.contentId;
  const userId = req.body.userId;

  if (!contentId) {
    res.status(400).json({
      error: 'contentId is required'
    });
    return;
  }

  if (!userId) {
    res.status(400).json({
      error: 'userId is required'
    });
    return;
  }

  try {
    const roomName = rooms.contentRoom(contentId);
    const contentRoom = global.rootNamespace.adapter.rooms.get(roomName);
    if (contentRoom) {
      contentRoom.add(userId);
    } else {
      global.rootNamespace.adapter.rooms.set(roomName, new Set([userId]));
    }
  } catch (error) {
    logger.log(logLevel.error, "Error occured in createRoom Call", error);
    return res.json({
      success: true,
      message: "ROOM CREATION FAILURE",
    });
  }

  return res.json({
    success: true,
    message: "ROOM CREATION SUCCESS",
  });
}