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
exports.TYPE_USER_FOR_CHAT_CONSTANT = "USER";

//GPT CONSTANTS
exports.GPT_CHAT_CONSTANTS = {
    model: "gpt-3.5-turbo",
    stream: true,
    presence_penalty: 0,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
}

// EVENTS SENT
exports.NEW_MESSAGE = "NEW_MESSAGE";

// EVENTS CREATED
exports.JOIN_ROOM = "JOIN_ROOM";
exports.JOIN_CONTENT_ROOM = "JOIN_CONTENT_ROOM";
exports.CHAT_MESSAGE = "CHAT_MESSAGE";
exports.DISCONNECT = "disconnect";