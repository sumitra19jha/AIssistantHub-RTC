const {
    GET_SOCKET_BY_ID,
    GET_USER_BY_SOCKET_ID
} = require("../../constants");

exports.hookFunction = (ns) => (request, cb) => {
    // every socket.io server execute below, when customRequest requested
    const type = request.type;
    console.log(request);
    if (type === GET_SOCKET_BY_ID) {
        const {
            socketId
        } = request;
        // get all socket objects on local socket.io server
        const sockets = ns.connected;
        cb(sockets[socketId]);
        return;
    }
    if (type === GET_USER_BY_SOCKET_ID) {
        const {
            socketId
        } = request;
        // get all socket objects on local socket.io server
        const sockets = ns.connected;
        if (sockets[socketId] && sockets[socketId].user) {
            cb({
                ...sockets[socketId].user
            });
        } else {
            cb();
        }
        return;
    }
    cb();
};