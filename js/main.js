// Initialize emotes first
initializeEmotes().then(() => {
    // Initialize chat client
    const tmiClient = createTwitchClient();

    // Register event handlers
    tmiClient.on('message', onMessageHandler);
    tmiClient.on('connected', onConnectedHandler);

    // Connect to Twitch
    tmiClient.connect().catch(console.error);
});