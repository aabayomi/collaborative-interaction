

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;

app.use(express.static(__dirname + '/public'));

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
http.listen(port, () => console.log('listening on port ' + port));
