const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const QRCode = require('qrcode');

// KLUCZOWA ZMIANA DLA RENDER.COM:
// Używamy portu przydzielonego przez serwer (process.env.PORT) lub 3000 lokalnie
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = [];
const roles = ['Harry Potter (Auror)', 'Ron Weasley (Straznik)', 'Smierciozerca (Mafia)', 'Uczeń Hogwartu'];

io.on('connection', (socket) => {
    players.push(socket.id);
    console.log(`--- NOWE POLACZENIE ---`);
    console.log(`ID Maga: ${socket.id}`);
    console.log(`Liczba osob w Hogwarcie: ${players.length}`);
    console.log(`-----------------------`);

    socket.on('start-game', () => {
        console.log('Tiara Przydzialu zaczyna prace...');
        const allSockets = Array.from(io.sockets.sockets.values());
        let availableRoles = [...roles];
        
        allSockets.forEach(s => {
            const randomIdx = Math.floor(Math.random() * availableRoles.length);
            const assignedRole = availableRoles[randomIdx] || 'Uczeń Hogwartu';
            
            if (availableRoles.length > 0) {
                availableRoles.splice(randomIdx, 1);
            }
            
            s.emit('assign-role', assignedRole);
        });
    });

    socket.on('disconnect', () => {
        players = players.filter(id => id !== socket.id);
        console.log('Czarodziej opuscił serwer.');
    });
});

// Słuchamy na 0.0.0.0, aby serwer był widoczny w sieci
http.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(40));
    console.log('   MAGICZNE STUDIO SKAWINA LIVE!   ');
    console.log('='.repeat(40));
    console.log(`Serwer dziala na porcie: ${PORT}`);
    
    // Kod QR wygeneruje się tylko jeśli odpalasz to lokalnie na komputerze
    if (!process.env.PORT) {
        console.log('\nLOKALNY KOD QR:');
        QRCode.toString(`http://localhost:${PORT}`, {type:'terminal', small: true}, function (err, url) {
            console.log(url);
        });
    }
});
