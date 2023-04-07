exports.logLevel = {
    info: "info",
    error: "error",
    debug: "debug",
};

exports.rooms = {
    all: "KeywordIQ",
    userRoom: (userId) => `user/${userId}`,
    contentRoom: (contentId) => `content/${contentId}`,
};

exports.GET_SOCKET_BY_ID = "GET_SOCKET_BY_ID";
exports.GET_USER_BY_SOCKET_ID = "GET_USER_BY_SOCKET_ID";

exports.CHAT_MESSAGE = "CHAT_MESSAGE";
exports.JOIN_ROOM = "JOIN_ROOM";