const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const axios = require('axios'); // Musisz dopisać 'axios' w package.json

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

let players = [];
let targetPlayerCount = 0;
let globalRolesPool = [];

// TWOJA LOGIKA RÓL
const roleDefs = {
    dark: [
        { name: 'Lord Voldemort', icon: '🐍', desc: 'Lider Mafii. Wybierasz ofiarę do Avada Kedavra. Jesteś niewykrywalny dla Harry’ego.' },
        { name: 'Smierciozerca', icon: '💀', desc: 'Służysz Panu Ciemności. Razem wybieracie cel do Avada Kedavra.' },
        { name: 'Bellatrix Lestrange', icon: '🪄', desc: 'Wierna służka. Możesz uciszyć gracza na jedną turę.' }
    ],
    special: [
        { name: 'Harry Potter (Auror)', icon: '⚡', desc: 'Co noc sprawdzasz lojalność jednego gracza.' },
        { name: 'Albus Dumbledore', icon: '🧙‍♂️', desc: 'Mentor. Raz w grze możesz poznać role dwóch osób naraz.' },
        { name: 'Syriusz Black', icon: '🐾', desc: 'Animag. Jeśli zostaniesz wskazany do Avada Kedavra, masz 50% szans na ucieczkę.' },
        { name: 'Hermiona Granger', icon: '📚', desc: 'Raz w grze możesz uratować kogoś przed śmiercią.' },
        { name: 'Ron Weasley', icon: '🍗', desc: 'Obrońca. Wybierz osobę, którą osłonisz przed zaklęciem tej nocy.' },
        { name: 'Zgredek', icon: '🧦', desc: 'Wolny Skrzat. Możesz poświęcić się, by uratować innego gracza.' },
        { name: 'Irytek', icon: '🤡', desc: 'Poltergeist. Co noc zamieniasz role dwóch osób (tylko wizualnie).' },
        { name: 'Severus Snape', icon: '🧪', desc: 'Szpieg. Jeśli Harry zginie, Twoja misja kończy się klęską.' }
    ],
    normal: { name: 'Uczeń Hogwartu', icon: '🏰', desc: 'Mieszkaniec zamku. Twoją bronią jest głosowanie w dzień.' }
};

// ZAKLĘCIE PODTRZYMUJĄCE (Pinger)
const keepAlive = (url) => {
    setInterval(() => {
        axios.get(url).then(() => console.log('Serwer Studio Skawina czuwa...')).catch(() => {});
    }, 45000); // Ping co 45 sekund, żeby nie zasnął
};

io.on('connection', (socket) => {
    socket.on('set-game-config', (config) => {
        targetPlayerCount = parseInt(config.count);
        let rolesPool = [];
        
        // BALANS WOJTKA
        let darkCount = 3 + Math.floor((targetPlayerCount - 10) / 4);
        for(let i=0; i < darkCount; i++) rolesPool.push(roleDefs.dark[i % roleDefs.dark.length]);

        let availableSpecials = [...roleDefs.special].sort(() => 0.5 - Math.random());
        let specToAssign = 2 + (targetPlayerCount >= 14 ? 2 : 0) + Math.floor((targetPlayerCount - 14) / 4);
        
        for(let i=0; i < specToAssign && i < availableSpecials.length; i++) rolesPool.push(availableSpecials[i]);
        while(rolesPool.length < targetPlayerCount) rolesPool.push(roleDefs.normal);

        globalRolesPool = rolesPool.sort(() => 0.5 - Math.random());
        players = []; 
        io.emit('game-ready', { target: targetPlayerCount });
        
        // Aktywuj pinger po rozpoczęciu konfiguracji
        const fullUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
        if (process.env.RENDER_EXTERNAL_HOSTNAME) keepAlive(fullUrl);
    });

    socket.on('join-game', (name) => {
        if (players.length < targetPlayerCount) {
            const role = globalRolesPool[players.length];
            const playerInfo = { name, role: role.name, icon: role.icon, desc: role.desc };
            players.push(playerInfo);
            socket.emit('assign-role', playerInfo);
            io.emit('update-player-list', { players, target: targetPlayerCount });
        }
    });

    socket.on('start-intrigue', () => io.emit('transition-to-night'));
});

http.listen(PORT, '0.0.0.0', () => console.log(`Serwer Magiczne Studio Skawina gotowy!`));
