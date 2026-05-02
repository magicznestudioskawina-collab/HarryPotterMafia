const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const axios = require('axios');

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

let players = [];
let targetPlayerCount = 0;
let globalRolesPool = [];

const roleDefs = {
    dark: [
        { name: 'Lord Voldemort', icon: '🐍', desc: 'Lider Mafii. Wybierasz ofiarę do Avada Kedavra.' },
        { name: 'Smierciozerca', icon: '💀', desc: 'Służysz Panu Ciemności. Razem wybieracie cel do Avada Kedavra.' },
        { name: 'Bellatrix Lestrange', icon: '🪄', desc: 'Wierna służka. Możesz uciszyć gracza na jedną turę.' }
    ],
    special: [
        { name: 'Harry Potter (Auror)', icon: '⚡', desc: 'Co noc sprawdzasz lojalność jednego gracza.' },
        { name: 'Albus Dumbledore', icon: '🧙‍♂️', desc: 'Mentor. Raz w grze możesz poznać role dwóch osób naraz.' },
        { name: 'Syriusz Black', icon: '🐾', desc: 'Animag. Masz 50% szans na ucieczkę przed Avada Kedavra.' },
        { name: 'Hermiona Granger', icon: '📚', desc: 'Raz w grze możesz uratować kogoś przed śmiercią.' },
        { name: 'Ron Weasley', icon: '🍗', desc: 'Obrońca. Wybierz osobę, którą osłonisz przed zaklęciem.' },
        { name: 'Zgredek', icon: '🧦', desc: 'Wolny Skrzat. Możesz poświęcić życie, by uratować innego gracza.' },
        { name: 'Irytek', icon: '🤡', desc: 'Poltergeist. Co noc robisz zamieszanie.' },
        { name: 'Severus Snape', icon: '🧪', desc: 'Szpieg. Jeśli Harry zginie, Ty również przegrywasz.' }
    ],
    normal: { name: 'Uczeń Hogwartu', icon: '🏰', desc: 'Głosuj mądrze w ciągu dnia. Przetrwaj!' }
};

io.on('connection', (socket) => {
    socket.on('set-game-config', (config) => {
        targetPlayerCount = parseInt(config.count);
        let rolesPool = [];
        
        let darkCount = 3 + Math.floor((targetPlayerCount - 10) / 4);
        for(let i=0; i < darkCount; i++) rolesPool.push(roleDefs.dark[i % roleDefs.dark.length]);

        let availableSpecials = [...roleDefs.special].sort(() => 0.5 - Math.random());
        let specToAssign = 2 + (targetPlayerCount >= 14 ? 2 : 0) + Math.floor((targetPlayerCount - 14) / 4);
        
        for(let i=0; i < specToAssign && i < availableSpecials.length; i++) rolesPool.push(availableSpecials[i]);
        while(rolesPool.length < targetPlayerCount) rolesPool.push(roleDefs.normal);

        globalRolesPool = rolesPool.sort(() => 0.5 - Math.random());
        players = []; 
        io.emit('game-ready', { target: targetPlayerCount });
    });

    socket.on('join-game', (name) => {
        if (players.length < targetPlayerCount) {
            const role = globalRolesPool[players.length];
            const playerInfo = { id: socket.id, name, role: role.name, icon: role.icon, desc: role.desc };
            players.push(playerInfo);
            socket.emit('assign-role', playerInfo);
            io.emit('update-player-list', { players, target: targetPlayerCount });
        }
    });

    socket.on('start-intrigue', () => {
        // Przygotowanie listy Śmierciożerców dla nich samych
        const darkSidePlayers = players.filter(p => p.role.match(/Voldemort|Smierciozerca|Bellatrix/));
        const darkListNames = darkSidePlayers.map(p => `${p.name} (${p.role})`).join(", ");

        darkSidePlayers.forEach(p => {
            io.to(p.id).emit('reveal-mafia', darkListNames);
        });

        io.emit('transition-to-night');
    });
});

http.listen(PORT, '0.0.0.0', () => console.log(`Studio Skawina Live`));
