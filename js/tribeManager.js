class TribeManager {
    constructor() {
        this.tribes = new Map(); // emote -> Set of users
        this.userTribes = new Map(); // user -> emote
    }

    updateTribes(emote, users) {
        // Create tribe if it doesn't exist
        if (!this.tribes.has(emote)) {
            this.tribes.set(emote, new Set());
        }

        // Add users to new tribe
        users.forEach(user => {
            // Remove from old tribe if exists
            const oldTribe = this.userTribes.get(user);
            if (oldTribe) {
                this.tribes.get(oldTribe).delete(user);
            }

            // Add to new tribe
            this.tribes.get(emote).add(user);
            this.userTribes.set(user, emote);
        });

        this.updateTribeDisplay();
    }

    updateTribeDisplay() {
        const container = document.getElementById('tribe-members');
        container.innerHTML = '';

        this.tribes.forEach((users, emote) => {
            if (users.size > 0) {
                const tribeDiv = document.createElement('div');
                tribeDiv.className = 'tribe';
                
                // Add emote
                const emoteImg = document.createElement('img');
                emoteImg.src = emoteMap.get(emote);
                emoteImg.className = 'chat-emote';
                tribeDiv.appendChild(emoteImg);

                // Add users
                const userList = document.createElement('span');
                userList.textContent = Array.from(users).join(', ');
                tribeDiv.appendChild(userList);

                container.appendChild(tribeDiv);
            }
        });
    }
}