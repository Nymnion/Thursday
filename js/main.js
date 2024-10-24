// Initialize everything
initializeEmotes().then(() => {
    window.gameManager = new GameManager();
    window.tribeManager = new TribeManager();

    // Initialize the client
    const client = createTwitchClient();

    // Connect to Twitch
    client.connect().catch(console.error);
});