const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Nowy czarodziej w zamku!');

    socket.on('start-game', () => {
        const allSockets = Array.from(io.sockets.sockets.values());
        const count = allSockets.length;

        // Dynamiczny balans ról
        let gameRoles = [];
        if (count >= 1) gameRoles.push('Harry Potter (Auror)');
        if (count >= 2) gameRoles.push('Lord Voldemort (Lider Mafii)');
        if (count >= 3) gameRoles.push('Ron Weasley (Straznik)');
        if (count >= 4) gameRoles.push('Smierciozerca (Mafia)');
        if (count >= 5) gameRoles.push('Hermiona Granger (Logika)');
        if (count >= 6) gameRoles.push('Severus Snape (Szpieg)');
        
        // Reszta to uczniowie
        while (gameRoles.length < count) {
            gameRoles.push('Uczeń Hogwartu');
        }

        let shuffled = gameRoles.sort(() => 0.5 - Math.random());
        
        // Sygnał do dźwięku dla urządzenia, które kliknęło START
        socket.emit('play-sound');

        allSockets.forEach((s, index) => {
            s.emit('assign-role', shuffled[index]);
        });
    });
});

http.listen(PORT, '0.0.0.0', () => console.log(`Serwer na porcie ${PORT}`));
