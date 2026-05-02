const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

let gameStarted = false;

io.on('connection', (socket) => {
    socket.on('start-game', () => {
        if (gameStarted) return; // Zapobiega ponownemu losowaniu w trakcie gry
        
        gameStarted = true;
        const allSockets = Array.from(io.sockets.sockets.values());
        const count = allSockets.length;

        // Balans ról Studio Skawina
        let gameRoles = [];
        if (count >= 1) gameRoles.push('Harry Potter (Auror)');
        if (count >= 2) gameRoles.push('Lord Voldemort (Lider Mafii)');
        if (count >= 3) gameRoles.push('Ron Weasley (Straznik)');
        if (count >= 4) gameRoles.push('Smierciozerca (Mafia)');
        
        while (gameRoles.length < count) gameRoles.push('Uczeń Hogwartu');
        let shuffled = gameRoles.sort(() => 0.5 - Math.random());

        allSockets.forEach((s, index) => {
            s.emit('assign-role', shuffled[index]);
        });

        // Powiadomienie o starcie nocy do wszystkich
        io.emit('night-started');
    });

    socket.on('reset-game', () => {
        gameStarted = false;
        io.emit('game-reset');
    });
});

http.listen(PORT, '0.0.0.0', () => console.log(`Serwer na porcie ${PORT}`));
