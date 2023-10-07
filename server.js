const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static('public'));
const colors = ["red", "blue", "green", "yellow", "purple", "orange"]; 
let userCount = 0;

io.on('connection', (socket) => {
    userCount++;
    const userColor = colors[userCount % colors.length]; 
    socket.emit('assignedColor', userColor); 

    io.emit('updateUserCount', userCount);
    console.log('a user connected');

    socket.on('clearCanvas', (data) => {
        socket.broadcast.emit('clearCanvas', data);
        console.log('clearing canvas');
    });
    
    socket.on('draw', (data) => {
        socket.broadcast.emit('draw', data);
        console.log(data); 
    });

    socket.on('drawing', function (data) {
        socket.broadcast.emit('drawing', data);
      });
   
    socket.on('colorChange', (color) => {
        console.log(`User ${socket.id} changed color to ${color}`);
        
    });

    socket.on('disconnect', () => {
        userCount--;
        io.emit('updateUserCount', userCount);
        console.log('user disconnected');
    });
});


// Start the server.
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
