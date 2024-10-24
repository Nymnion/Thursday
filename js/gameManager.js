class GameManager {
    constructor() {
        this.tickDuration = 5000; // 5 seconds default
        this.currentTick = {};
        this.grid = new Array(100).fill(null);
        this.pastelColors = this.generatePastelColors();
        
        this.initializeGrid();
        this.initializeTickControls();
        this.startTickTimer();
    }

    generatePastelColors() {
        return Array.from({ length: 100 }, () => {
            const hue = Math.random() * 360;
            return `hsl(${hue}, 70%, 80%)`;
        });
    }

    initializeGrid() {
        const grid = document.getElementById('game-grid');
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.backgroundColor = this.pastelColors[i];
            
            const number = document.createElement('div');
            number.className = 'grid-number';
            number.textContent = i + 1;
            
            cell.appendChild(number);
            grid.appendChild(cell);
        }
    }

    initializeTickControls() {
        const slider = document.getElementById('tick-slider');
        const timer = document.getElementById('tick-timer');
        
        slider.addEventListener('input', (e) => {
            const newDuration = parseInt(e.target.value) * 1000;
            // Will be applied on next tick
            this.nextTickDuration = newDuration;
        });
    }

    startTickTimer() {
        let timeLeft = this.tickDuration;
        const timer = document.getElementById('tick-timer');
        
        const updateTimer = () => {
            timer.textContent = `Next tick in: ${(timeLeft / 1000).toFixed(1)}s`;
            timeLeft -= 100;
            
            if (timeLeft <= 0) {
                this.processTick();
                // Apply new duration if slider was changed
                if (this.nextTickDuration) {
                    this.tickDuration = this.nextTickDuration;
                    this.nextTickDuration = null;
                }
                timeLeft = this.tickDuration;
            }
        };

        setInterval(updateTimer, 100);
    }

    handleSpawnAttempt(username, emoteName, position, tags) {
        position = parseInt(position) - 1; // Convert to 0-based index
        if (position < 0 || position >= 100) return;

        // Highlight the message in chat
        const lastMessage = document.querySelector('.chat-message:last-child');
        if (lastMessage) {
            lastMessage.style.backgroundColor = this.pastelColors[position];
        }

        // Record the spawn attempt
        if (!this.currentTick[position]) {
            this.currentTick[position] = {};
        }
        if (!this.currentTick[position][emoteName]) {
            this.currentTick[position][emoteName] = new Set();
        }
        this.currentTick[position][emoteName].add(username);
    }

    processTick() {
        Object.entries(this.currentTick).forEach(([position, emotes]) => {
            position = parseInt(position);
            let maxVotes = 0;
            let winningEmote = null;
            let winners = new Set();
            let tie = false;

            // Find the emote with most votes
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
            
            if (tie || !winningEmote) {
                // Show fail animation
                const fail = document.createElement('div');
                fail.className = 'spawn-fail';
                fail.textContent = '💥';
                cell.appendChild(fail);
                setTimeout(() => fail.remove(), 500);
            } else {
                // Clear existing content
                while (cell.children.length > 1) { // Keep the number
                    cell.removeChild(cell.lastChild);
                }
                
                // Add winning emote
                const emote = document.createElement('img');
                emote.src = emoteMap.get(winningEmote);
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
            }
        });

        // Clear current tick
        this.currentTick = {};
    }
}