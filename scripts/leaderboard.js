document.addEventListener('DOMContentLoaded', () => {
    const leaderboard = [
        { name: 'Player1', score: 300 },
        { name: 'Player2', score: 250 },
        { name: 'Player3', score: 200 },
    ];

    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboard.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name}: ${player.score} points`;
        leaderboardList.appendChild(li);
    });
});
