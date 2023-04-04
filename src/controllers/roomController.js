const db = require('../db');

function createRoom(req, res) {
  const roomId = req.body.roomId;

  if (!roomId) {
    res.status(400).json({ error: 'roomId is required' });
    return;
  }

  // Insert roomId into the database
  const query = 'INSERT INTO rooms (room_id) VALUES (?)';
  db.query(query, [roomId], (err, result) => {
    if (err) {
      console.error('Error inserting room:', err);
      res.status(500).json({ error: 'Failed to create room' });
      return;
    }

    res.status(201).json({ message: 'Room created', roomId });
  });
}

module.exports = {
  createRoom,
};
