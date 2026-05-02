const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

let players = [];
let targetPlayerCount = 0;

// Baza ról Studio Skawina
const roleDefs = {
    dark: [
        { name: 'Lord Voldemort', icon: '🐍', desc: 'Lider Mafii. Wybierasz ofiarę do Avada Kedavra. Jesteś niewykrywalny dla Harry’ego.' },
        { name: 'Smierciozerca', icon: '💀', desc: 'Służysz Panu Ciemności. Razem wybieracie cel do Avada Kedavra.' },
        { name: 'Bellatrix Lestrange', icon: '🪄', desc: 'Wierna służka. Możesz uciszyć gracza na jedną turę.' }
    ],
    special: [
        { name: 'Harry Potter (Auror)', icon: '⚡', desc: 'Co noc sprawdzasz lojalność jednego gracza.' },
        { name: 'Albus Dumbledore', icon: '🧙‍♂️', desc: 'Mentor. Raz w grze możesz poznać role dwóch osób naraz.' },
        { name: 'Syriusz Black', icon: '🐾', desc: 'Animag. Jeśli zostaniesz wskazany do zabicia, masz 50% szans na ucieczkę.' },
        { name: 'Hermiona Granger', icon: '📚', desc: 'Raz w grze możesz uratować kogoś przed wyrokiem.' },
        { name: 'Ron Weasley', icon: '🍗', desc: 'Obrońca. Wybierz osobę, którą osłonisz przed zaklęciem.' },
        { name: 'Zgredek', icon: '🧦', desc: 'Wolny Skrzat. Możesz poświęcić się, by uratować innego gracza.' },
        { name: 'Irytek', icon: '🤡', desc: 'Poltergeist. Co noc zamieniasz role dwóch osób (tylko wizualnie na jedną turę).' },
        { name: 'Severus Snape', icon: '🧪', desc: 'Szpieg. Jeśli Harry zginie, Twoja misja kończy się klęską.' }
    ],
    normal: { name: 'Uczeń Hogwartu', icon: '🏰', desc: 'Mieszkaniec zamku. Twoją jedyną bronią jest głosowanie w dzień.' }
};

io.on('connection', (socket) => {
    socket.on('set-game-config', (config) => {
        targetPlayerCount = parseInt(config.count);
        let rolesPool = [];
        
        // 1. Dodaj siły zła (Balans: 3 na 10 graczy, +1 na każde kolejne 4 osoby)
        let darkCount = 3 + Math.floor((targetPlayerCount - 10) / 4);
        for(let i=0; i < darkCount; i++) {
            rolesPool.push(roleDefs.dark[i % roleDefs.dark.length]);
        }

        // 2. Dodaj UNIKATOWE postacie specjalne (nie powtarzamy ich!)
        let availableSpecials = [...roleDefs.special].sort(() => 0.5 - Math.random());
        let specToAssign = 2 + (targetPlayerCount >= 14 ? 2 : 0) + Math.floor((targetPlayerCount - 14) / 4);
        
        for(let i=0; i < specToAssign && i < availableSpecials.length; i++) {
            rolesPool.push(availableSpecials[i]);
        }

        // 3. Resztę wypełnij zwykłymi czarodziejami
        while(rolesPool.length < targetPlayerCount) {
            rolesPool.push(roleDefs.normal);
        }

        // Przetasuj finalną pulę
        rolesPool = rolesPool.sort(() => 0.5 - Math.random());
        
        players = []; 
        globalRolesPool = rolesPool;
        io.emit('game-ready', { target: targetPlayerCount });
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

http.listen(PORT, '0.0.0.0', () => console.log(`Studio Skawina Live`));
