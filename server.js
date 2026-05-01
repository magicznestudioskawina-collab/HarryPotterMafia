const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Port musi być dynamiczny dla serwerów online
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = [];
const roles = ['Harry Potter (Auror)', 'Ron Weasley (Straznik)', 'Smierciozerca (Mafia)', 'Uczeń Hogwartu'];

io.on('connection', (socket) => {
    players.push(socket.id);
    console.log(`Nowy czarodziej online! ID: ${socket.id}`);

    socket.on('start-game', () => {
        const allSockets = Array.from(io.sockets.sockets.values());
        let availableRoles = [...roles];
        
        allSockets.forEach(s => {
            const randomIdx = Math.floor(Math.random() * availableRoles.length);
            const assignedRole = availableRoles[randomIdx] || 'Uczeń Hogwartu';
            if (availableRoles.length > 0) availableRoles.splice(randomIdx, 1);
            s.emit('assign-role', assignedRole);
        });
    });

    socket.on('disconnect', () => {
        players = players.filter(id => id !== socket.id);
    });
});

http.listen(PORT, () => {
    console.log(`Serwer Magicznego Studia Skawina dziala na porcie ${PORT}`);
});