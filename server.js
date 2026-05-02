const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

let players = [];

// Rozszerzona lista ról Studio Skawina
const roleDefinitions = {
    'Harry Potter (Auror)': { icon: '⚡', desc: 'Co noc sprawdzasz lojalność gracza. Szukasz sług Czarnego Pana.' },
    'Lord Voldemort': { icon: '🐍', desc: 'Lider Mafii. Wybierasz ofiarę do Avada Kedavra. Jesteś niewykrywalny dla Harry’ego.' },
    'Hermiona Granger': { icon: '📚', desc: 'Geniusz logiki. Raz w grze możesz cofnąć wyrok i uratować kogoś przed śmiercią.' },
    'Bellatrix Lestrange': { icon: '🪄', desc: 'Wierna służka. Raz w grze możesz rzucić klątwę uciszającą gracza na cały dzień.' },
    'Ron Weasley': { icon: '🍗', desc: 'Obrońca. Wybierz osobę, którą osłonisz przed morderczym zaklęciem tej nocy.' },
    'Severus Snape': { icon: '🧪', desc: 'Szpieg o dwóch twarzach. Sprawdzasz role innych. Jeśli Harry zginie, Twoja misja kończy się klęską.' },
    'Syriusz Black': { icon: '🐾', desc: 'Animag. Jeśli zostaniesz wskazany do zabicia, masz 50% szans na ucieczkę jako pies.' },
    'Smierciozerca': { icon: '💀', desc: 'Wykonujesz rozkazy Voldemorta. Razem wybieracie cel do Avada Kedavra.' },
    'Neville Longbottom': { icon: '🌱', desc: 'Bohater. Jeśli zginiesz, zabierasz jednego Śmierciożercę ze sobą do grobu.' },
    'Uczeń Hogwartu': { icon: '🏰', desc: 'Mieszkaniec zamku. Twoją jedyną bronią jest głosowanie w ciągu dnia.' }
};

io.on('connection', (socket) => {
    socket.on('join-game', (name) => {
        const roleKeys = Object.keys(roleDefinitions);
        const roleName = roleKeys[players.length % roleKeys.length];
        const playerInfo = { 
            id: socket.id, 
            name: name, 
            role: roleName, 
            icon: roleDefinitions[roleName].icon,
            desc: roleDefinitions[roleName].desc
        };
        players.push(playerInfo);
        socket.emit('assign-role', playerInfo);
        io.emit('update-player-list', players);
    });

    socket.on('start-intrigue', () => {
        io.emit('transition-to-night');
    });
});

http.listen(PORT, '0.0.0.0', () => console.log(`Studio Skawina działa na ${PORT}`));
