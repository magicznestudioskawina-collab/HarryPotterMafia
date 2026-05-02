const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

let players = [];
const roles = [
    'Harry Potter (Auror)', 'Lord Voldemort (Lider Mafii)', 
    'Ron Weasley (Straznik)', 'Smierciozerca (Mafia)', 
    'Hermiona Granger (Logika)', 'Severus Snape (Szpieg)', 
    'Uczeń Hogwartu', 'Neville Longbottom (Bohater)'
];

io.on('connection', (socket) => {
    // Gracz dołącza
    socket.on('join-game', (name) => {
        const role = roles[players.length % roles.length];
        const newPlayer = { id: socket.id, name: name, role: role, alive: true };
        players.push(newPlayer);
        
        // Wysyłamy rolę do gracza
        socket.emit('assign-role', newPlayer);
        // Aktualizujemy listę na ekranie głównym
        io.emit('update-player-list', players);
    });

    socket.on('start-intrigue', () => {
        io.emit('play-intro-sound');
    });
});

http.listen(PORT, '0.0.0.0', () => console.log(`Studio Skawina Live na ${PORT}`));
