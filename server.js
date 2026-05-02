const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const roles = [
    'Harry Potter (Auror)', 
    'Ron Weasley (Straznik)', 
    'Hermiona Granger (Logika)',
    'Albus Dumbledore (Mentor)',
    'Severus Snape (Szpieg)', 
    'Smierciozerca (Mafia)', 
    'Bellatrix Lestrange (Mafia)',
    'Lord Voldemort (Lider Mafii)',
    'Uczeń Hogwartu',
    'Neville Longbottom (Bohater)'
];

io.on('connection', (socket) => {
    console.log('Czarodziej dołączył do sieci!');

    socket.on('start-game', () => {
        const allSockets = Array.from(io.sockets.sockets.values());
        let shuffledRoles = [...roles].sort(() => 0.5 - Math.random());
        
        allSockets.forEach((s, index) => {
            const assignedRole = shuffledRoles[index % shuffledRoles.length];
            s.emit('assign-role', assignedRole);
        });
    });

    socket.on('disconnect', () => {
        console.log('Czarodziej opuścił zamek.');
    });
});

http.listen(PORT, '0.0.0.0', () => {
    console.log(`Magiczne Studio Skawina działa na porcie ${PORT}`);
});
