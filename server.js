// Nasze Magiczne Studio Skawina - Role do Harry Potter Mafia
const rolesPool = [
    'Harry Potter (Lider)', 
    'Albus Dumbledore (Wizjoner)', 
    'Lord Voldemort (Mafia)', 
    'Bellatrix Lestrange (Mafia)',
    'Irytek (Neutralny - Chaos)', // Nasz brakujący psotnik!
    'Zgredek (Skrzat Domowy)'     // Wierny przyjaciel
];

// Funkcja losująca dla Wojtka (Zaklinacza Kodu)
function getRolesForPlayers(playerCount) {
    let finalRoles = [...rolesPool];
    
    // Jeśli graczy jest więcej niż głównych ról, dodajemy Zwykłych Czarodziejów
    while (finalRoles.length < playerCount) {
        finalRoles.push('Zwykły Czarodziej (Mieszkaniec)');
    }
    
    // Jeśli graczy jest mało, przycinamy listę (z zachowaniem Mafii i Harry'ego)
    return finalRoles.slice(0, playerCount).sort(() => Math.random() - 0.5);
}
