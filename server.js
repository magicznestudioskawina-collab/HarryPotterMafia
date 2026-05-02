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
        { name: 'Lord Voldemort', icon: '🐍', desc: 'Lider Mafii. Wybierasz ofiarę do Avada Kedavra. Jesteś niewykrywalny dla Harry’ego.' },
        { name: 'Smierciozerca', icon: '💀', desc: 'Służysz Panu Ciemności. Razem wybieracie cel do Avada Kedavra.' },
        { name: 'Bellatrix Lestrange', icon: '🪄', desc: 'Wierna służka. Możesz rzucić klątwę uciszającą gracza na jedną turę.' }
    ],
    special: [
        { name: 'Harry Potter (Auror)', icon: '⚡', desc: 'Co noc sprawdzasz lojalność jednego gracza.' },
        { name: 'Albus Dumbledore', icon: '🧙‍♂️', desc: 'Mentor. Raz w grze możesz poznać role dwóch osób naraz.' },
        { name: 'Syriusz Black', icon: '🐾', desc: 'Animag. Jeśli zostaniesz wskazany do Avada Kedavra, masz 50% szans na ucieczkę.' },
        { name: 'Hermiona Granger', icon: '📚', desc: 'Geniusz. Raz w grze możesz uratować kogoś przed śmiercią.' },
        { name: 'Ron Weasley', icon: '🍗', desc: 'Obrońca. Wybierz osobę, którą osłonisz przed zaklęciem tej nocy.' },
        { name: 'Zgredek', icon: '🧦', desc: 'Wolny Skrzat. Możesz poświęcić życie, by uratować innego gracza.' },
        { name: 'Irytek', icon: '🤡', desc: 'Poltergeist. Co noc robisz zamieszanie, zmieniając wizualnie role dwóch osób.' },
        { name: 'Severus Snape', icon: '🧪', desc: 'Szpieg. Jeśli Harry Potter zginie, Ty również przegrywasz.' }
    ],
    normal: { name: 'Uczeń Hogwartu', icon: '🏰', desc: 'Twoją jedyną bronią jest głosowanie w ciągu dnia. Przetrwaj!' }
};

// Mechanizm podtrzymywania serwera na Renderze
const keepAlive = () => {
    if (process.env.RENDER_EXTERNAL_URL) {
        setInterval(() => {
            axios.get(process.env.RENDER_EXTERNAL_URL).catch(() => {});
        }, 40000);
    }
};

io.on('connection', (socket) => {
    socket.on('set-game-config', (config) => {
        targetPlayerCount = parseInt(config.count);
        let rolesPool = [];
        
        // Logika Wojtka: Balans Mroku
        let darkCount = 3 + Math.floor((targetPlayerCount - 10) / 4);
        for(let i=0; i < darkCount; i++) {
            rolesPool.push(roleDefs.dark[i % roleDefs.dark.length]);
        }

        // Logika Wojtka: Unikatowe postacie specjalne
        let availableSpecials = [...roleDefs.special].sort(() => 0.5 - Math.random());
        let specToAssign = 2 + (targetPlayerCount >= 14 ? 2 : 0) + Math.floor((targetPlayerCount - 14) / 4);
        
        for(let i=0; i < specToAssign && i < availableSpecials.length; i++) {
            rolesPool.push(availableSpecials[i]);
        }

        // Reszta to Uczniowie
        while(rolesPool.length < targetPlayerCount) {
            rolesPool.push(roleDefs.normal);
        }

        globalRolesPool = rolesPool.sort(() => 0.5 - Math.random());
        players = []; 
        io.emit('game-ready', { target: targetPlayerCount });
        keepAlive();
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

http.listen(PORT, '0.0.0.0', () => console.log(`Potyczka w Hogwarcie Live!`));
