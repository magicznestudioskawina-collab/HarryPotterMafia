const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

let players = [];
const roleDefinitions = {
    'Harry Potter (Auror)': { icon: '⚡', desc: 'Lider Zakonu. Co noc sprawdzasz lojalność jednego gracza.' },
    'Lord Voldemort (Lider Mafii)': { icon: '🐍', desc: 'Pan Ciemności. Twoja tożsamość jest ukryta przed czarami sprawdzającymi.' },
    'Ron Weasley (Straznik)': { icon: '🍗', desc: 'Wybrany przez Ciebie gracz jest bezpieczny tej nocy.' },
    'Smierciozerca (Mafia)': { icon: '💀', desc: 'Służysz Voldemortowi. Razem wyeliminujcie czarodziejów.' },
    'Hermiona Granger (Logika)': { icon: '📚', desc: 'Twoja wiedza pozwala raz uratować kogoś przed wygnaniem.' },
    'Severus Snape (Szpieg)': { icon: '🧪', desc: 'Sprawdzasz role innych. Twoje cele są Twoją tajemnicą.' },
    'Uczeń Hogwartu': { icon: '🏰', desc: 'Głosuj mądrze w dzień i spróbuj przetrwać w zamku.' }
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
