const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

let players = [];
let targetPlayerCount = 0;

const roleDefs = {
    dark: [
        { name: 'Lord Voldemort', icon: '🐍', desc: 'Lider Mafii. Wybierasz ofiarę do Avada Kedavra.' },
        { name: 'Smierciozerca', icon: '💀', desc: 'Służysz Panu Ciemności. Razem wybieracie cel do Avada Kedavra.' },
        { name: 'Bellatrix Lestrange', icon: '🪄', desc: 'Wierna służka. Możesz uciszyć gracza na jedną turę.' }
    ],
    special: [
        { name: 'Harry Potter (Auror)', icon: '⚡', desc: 'Co noc sprawdzasz lojalność jednego gracza.' },
        { name: 'Ron Weasley', icon: '🍗', desc: 'Obrońca. Wybierz osobę, którą osłonisz przed zaklęciem.' },
        { name: 'Hermiona Granger', icon: '📚', desc: 'Raz w grze możesz uratować kogoś przed śmiercią.' },
        { name: 'Severus Snape', icon: '🧪', desc: 'Szpieg. Sprawdzasz role innych. Jeśli Harry zginie, przegrywasz.' }
    ],
    normal: { name: 'Uczeń Hogwartu', icon: '🏰', desc: 'Mieszkaniec zamku. Twoją bronią jest głosowanie w dzień.' }
};

io.on('connection', (socket) => {
    socket.on('set-player-count', (count) => {
        targetPlayerCount = parseInt(count);
        players = []; // Reset gry
        io.emit('game-ready', targetPlayerCount);
    });

    socket.on('join-game', (name) => {
        if (players.length >= targetPlayerCount) {
            socket.emit('error-msg', 'Hogwart jest już pełny!');
            return;
        }

        // DYNAMIK BALANSU WOJTKA:
        // 10 graczy: 3 Dark (Vold + 2 Smierć), 2 Special, 5 Normal
        // 14 graczy: 4 Dark, 4 Special, 6 Normal
        let rolesPool = [];
        let darkCount = 3 + Math.floor((targetPlayerCount - 10) / 4);
        let specCount = 2 + (targetPlayerCount >= 14 ? 2 : 0) + Math.floor((targetPlayerCount - 14) / 4);
        
        // Budowanie puli ról
        for(let i=0; i<darkCount; i++) rolesPool.push(roleDefs.dark[i % roleDefs.dark.length]);
        for(let i=0; i<specCount; i++) rolesPool.push(roleDefs.special[i % roleDefs.special.length]);
        while(rolesPool.length < targetPlayerCount) rolesPool.push(roleDefs.normal);

        // Losowanie roli dla dołączającego
        const role = rolesPool[players.length];
        const playerInfo = { name, role: role.name, icon: role.icon, desc: role.desc };
        
        players.push(playerInfo);
        socket.emit('assign-role', playerInfo);
        io.emit('update-player-list', { players, target: targetPlayerCount });
    });

    socket.on('start-intrigue', () => io.emit('transition-to-night'));
});

http.listen(PORT, '0.0.0.0', () => console.log(`Studio Skawina działa na ${PORT}`));
