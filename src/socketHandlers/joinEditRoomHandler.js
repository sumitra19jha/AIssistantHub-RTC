const { JOIN_EDIT_ROOM, rooms } = require("../constants");

const joinEditRoomHandler = (socket) => async (data) => {
    const { contentId } = data;

    if (!contentId) {
        return;
    }

    const editRoom = rooms.editRoom(contentId);

    // Join the specified edit room
    socket.join(editRoom, () => { console.log(`User joined edit room ${editRoom}`); });
};


module.exports = joinEditRoomHandler;
