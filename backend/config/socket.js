// socket.js
const socketio = require('socket.io');
const { Chat } = require('../models/Chat');
const Group = require('../models/Group');

function setupSocket(server) {
  const io = socketio(server);

  io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // Event to join a group chat room
    socket.on('joinGroup', async ({ groupId, userId }) => {
      const group = await Group.findById(groupId);

      if (group && group.members.includes(userId)) {
        socket.join(groupId);
        socket.emit('message', { content: 'Welcome to the group chat!', sender: 'System' });
      } else {
        socket.emit('error', { message: 'You are not authorized to join this group.' });
      }
    });

    // Event to handle incoming chat messages
    socket.on('sendMessage', async ({ groupId, userId, content }) => {
      const group = await Group.findById(groupId);

      if (!group) return socket.emit('error', { message: 'Group not found' });

      // Check if chat is locked
      if (group.chatLocked) {
        return socket.emit('message', { content: 'Chat is currently locked by the admin.', sender: 'System' });
      }

      // Save message to the database
      const message = new Chat({
        group: groupId,
        sender: userId,
        content,
        timestamp: new Date(),
      });
      await message.save();

      // Emit message to everyone in the group room
      io.to(groupId).emit('message', {
        sender: userId,
        content,
        timestamp: message.timestamp,
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return io;
}

module.exports = setupSocket;
