class GameManager {
    constructor() {
        this.tickDuration = 5000;
        this.currentTick = {
            spawns: {},
            attacks: {}
        };
        this.grid = new Array(100).fill(null);
        this.spawnedEmotes = new Set();
        this.tribeColors = new Map();
        this.gameEnded = false;
        
        this.initializeGrid();
        this.initializeTickControls();
        this.startTickTimer();
    }

    generateTribeColor() {
        const hue = (this.tribeColors.size * 137.508) % 360;
        return `hsl(${hue}, 70%, 35%)`;
    }

    isAdjacent(pos1, pos2) {
        const row1 = Math.floor(pos1 / 10);
        const col1 = pos1 % 10;
        const row2 = Math.floor(pos2 / 10);
        const col2 = pos2 % 10;
        
        return (
            (Math.abs(row1 - row2) === 1 && col1 === col2) ||
            (Math.abs(col1 - col2) === 1 && row1 === row2)
        );
    }

    initializeGrid() {
        const grid = document.getElementById('game-grid');
        grid.innerHTML = '';
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            const number = document.createElement('div');
            number.className = 'grid-number';
            number.textContent = i + 1;
            
            cell.appendChild(number);
            grid.appendChild(cell);
        }
    }

    handleSpawnAttempt(username, emoteName, position, tags) {
        if (this.gameEnded) return;

        position = parseInt(position) - 1;
        if (position < 0 || position >= 100) return;
        if (this.spawnedEmotes.has(emoteName)) return;
        if (this.grid[position]) return;

        if (!this.currentTick.spawns[position]) {
            this.currentTick.spawns[position] = {};
        }
        if (!this.currentTick.spawns[position][emoteName]) {
            this.currentTick.spawns[position][emoteName] = new Set();
        }
        this.currentTick.spawns[position][emoteName].add(username);

        // Highlight the message
        const lastMessage = document.querySelector('.chat-message:last-child');
        if (lastMessage) {
            lastMessage.style.backgroundColor = '#2a2a2a';
        }
    }

    handleAttackAttempt(username, emoteName, position, tags) {
        if (this.gameEnded) return;

        position = parseInt(position) - 1;
        if (position < 0 || position >= 100) return;
        if (!this.spawnedEmotes.has(emoteName)) return;
        if (this.grid[position]) return;

        // Check if user is in the right tribe
        const userTribe = tribeManager.getUserTribe(username);
        if (userTribe !== emoteName) return;

        // Check if position is adjacent to any existing territory
        let isValidAttack = false;
        for (let i = 0; i < 100; i++) {
            if (this.grid[i] === emoteName && this.isAdjacent(i, position)) {
                isValidAttack = true;
                break;
            }
        }
        if (!isValidAttack) return;

        if (!this.currentTick.attacks[position]) {
            this.currentTick.attacks[position] = {};
        }
        if (!this.currentTick.attacks[position][emoteName]) {
            this.currentTick.attacks[position][emoteName] = new Set();
        }
        this.currentTick.attacks[position][emoteName].add(username);

        // Highlight the message
        const lastMessage = document.querySelector('.chat-message:last-child');
        if (lastMessage) {
            lastMessage.style.backgroundColor = '#2a2a2a';
        }
    }

    checkVictory() {
        // Check horizontal
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col <= 6; col++) {
                const pos = row * 10 + col;
                const emote = this.grid[pos];
                if (emote &&
                    this.grid[pos + 1] === emote &&
                    this.grid[pos + 2] === emote &&
                    this.grid[pos + 3] === emote) {
                    this.showVictoryScreen(emote);
                    return true;
                }
            }
        }

        // Check vertical
        for (let row = 0; row <= 6; row++) {
            for (let col = 0; col < 10; col++) {
                const pos = row * 10 + col;
                const emote = this.grid[pos];
                if (emote &&
                    this.grid[pos + 10] === emote &&
                    this.grid[pos + 20] === emote &&
                    this.grid[pos + 30] === emote) {
                    this.showVictoryScreen(emote);
                    return true;
                }
            }
        }

        return false;
    }

    showVictoryScreen(winningEmote) {
        this.gameEnded = true;
        const screen = document.createElement('div');
        screen.className = 'victory-screen';
        
        const content = document.createElement('div');
        content.className = 'victory-content';
        
        const title = document.createElement('h1');
        title.textContent = `${winningEmote} Tribe Wins!`;
        
        const emote = document.createElement('img');
        emote.src = emoteMap.get(winningEmote);
        emote.className = 'victory-emote';
        
        content.appendChild(title);
        content.appendChild(emote);
        screen.appendChild(content);
        document.body.appendChild(screen);
    }

    processTick() {
        // Process spawns first
        Object.entries(this.currentTick.spawns).forEach(([position, emotes]) => {
            position = parseInt(position);
            let maxVotes = 0;
            let winningEmote = null;
            let winners = new Set();
            let tie = false;

            Object.entries(emotes).forEach(([emoteName, users]) => {
                const votes = users.size;
                if (votes > maxVotes) {
                    maxVotes = votes;
                    winningEmote = emoteName;
                    winners = users;
                    tie = false;
                } else if (votes === maxVotes) {
                    tie = true;
                }
            });

            const cell = document.querySelector(`.grid-cell:nth-child(${position + 1})`);
            
            if (!tie && winningEmote && !this.spawnedEmotes.has(winningEmote)) {
                this.spawnedEmotes.add(winningEmote);
                this.grid[position] = winningEmote;
                
                // Assign tribe color if new
                if (!this.tribeColors.has(winningEmote)) {
                    this.tribeColors.set(winningEmote, this.generateTribeColor());
                }
                
                // Update cell
                cell.style.backgroundColor = this.tribeColors.get(winningEmote);
                
                while (cell.children.length > 1) { // Keep the number
                    cell.removeChild(cell.lastChild);
                }
                
                // Add emote
                const emote = document.createElement('img');
                emote.src = emoteMap.get(winningEmote).replace('1x', '4x');
                emote.className = 'claimed-emote';
                cell.appendChild(emote);

                // Show winners
                const text = document.createElement('div');
                text.className = 'spawn-text';
                text.textContent = Array.from(winners).join(', ');
                cell.appendChild(text);
                setTimeout(() => text.remove(), 2000);

                // Update tribes
                tribeManager.updateTribes(winningEmote, winners);
            } else if (cell) {
                // Show fail animation
                const fail = document.createElement('div');
                fail.className = 'spawn-fail';
                fail.textContent = '💥';
                cell.appendChild(fail);
                setTimeout(() => fail.remove(), 500);
            }
        });

        // Then process attacks
        Object.entries(this.currentTick.attacks).forEach(([position, emotes]) => {
            position = parseInt(position);
            let maxVotes = 0;
            let winningEmote = null;
            let winners = new Set();
            let tie = false;

            Object.entries(emotes).forEach(([emoteName, users]) => {
                const votes = users.size;
                if (votes > maxVotes) {
                    maxVotes = votes;
                    winningEmote = emoteName;
                    winners = users;
                    tie = false;
                } else if (votes === maxVotes) {
                    tie = true;
                }
            });

            const cell = document.querySelector(`.grid-cell:nth-child(${position + 1})`);
            
            if (!tie && winningEmote && cell) {
                this.grid[position] = winningEmote;
                
                // Update cell
                cell.style.backgroundColor = this.tribeColors.get(winningEmote);
                
                while (cell.children.length > 1) { // Keep the number
                    cell.removeChild(cell.lastChild);
                }
                
                // Add emote
                const emote = document.createElement('img');
                emote.src = emoteMap.get(winningEmote).replace('1x', '4x');
                emote.className = 'claimed-emote';
                cell.appendChild(emote);

                // Show winners
                const text = document.createElement('div');
                text.className = 'spawn-text';
                text.textContent = Array.from(winners).join(', ');
                cell.appendChild(text);
                setTimeout(() => text.remove(), 2000);

                // Check for victory
                this.checkVictory();
            } else if (cell) {
                // Show fail animation
                const fail = document.createElement('div');
                fail.className = 'spawn-fail';
                fail.textContent = '💥';
                cell.appendChild(fail);
                setTimeout(() => fail.remove(), 500);
            }
        });

        // Clear current tick
        this.currentTick = {
            spawns: {},
            attacks: {}
        };
    }

    initializeTickControls() {
        const slider = document.getElementById('tick-slider');
        
        slider.addEventListener('input', (e) => {
            const newDuration = parseInt(e.target.value) * 1000;
            this.nextTickDuration = newDuration;
        });
    }

    startTickTimer() {
        let timeLeft = this.tickDuration;
        const timer = document.getElementById('tick-timer');
        
        const updateTimer = () => {
            if (this.gameEnded) return;
            
            timer.textContent = `Next tick in: ${(timeLeft / 1000).toFixed(1)}s`;
            timeLeft -= 100;
            
            if (timeLeft <= 0) {
                this.processTick();
                if (this.nextTickDuration) {
                    this.tickDuration = this.nextTickDuration;
                    this.nextTickDuration = null;
                }
                timeLeft = this.tickDuration;
            }
        };

        setInterval(updateTimer, 100);
    }
}