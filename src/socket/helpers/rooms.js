exports.joinRoom = (ns) => (socketId, roomId, callback) => {
    ns.adapter.remoteJoin(socketId, roomId, callback);
};