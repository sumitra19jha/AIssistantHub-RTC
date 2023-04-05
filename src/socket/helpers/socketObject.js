const {
    rooms,
    logLevel
} = require("../../constants");

exports.getSocketsFromAllNamespaces = (roomId) =>
    new Promise((resolve, reject) => {
        const room = global.rootNamespace.adapter.rooms.get(roomId);
        if (!room) {
            resolve({
                socketIds: []
            });
            return;
        }

        const socketIds = Array.from(room.keys());
        resolve({
            socketIds
        });
    });



exports.getSocketsOfUser = async (userId) => {
    const roomId = rooms.userRoom(userId);
    console.log(logLevel.info, "roomId", roomId);

    const {
        socketIds = []
    } = await this.getSocketsFromAllNamespaces(
        roomId
    );
    return socketIds;
};