// Initialize chat and game managers
const gameManager = new GameManager();
const tribeManager = new TribeManager();

// Initialize the client
const client = createTwitchClient();

// Connect to Twitch
initializeEmotes().then(() => {
    client.connect().catch(console.error);
});