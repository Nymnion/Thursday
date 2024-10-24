// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize emotes
        await initializeEmotes();
        
        // Initialize game manager and tribe manager
        window.gameManager = new GameManager();
        window.tribeManager = new TribeManager();

        // Wait a bit to ensure TMI.js is fully loaded
        setTimeout(() => {
            // Initialize the client
            const client = createTwitchClient();
            if (client) {
                // Connect to Twitch
                client.connect().catch(console.error);
            }
        }, 1000);
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});