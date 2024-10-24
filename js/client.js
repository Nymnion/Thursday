// Create and configure the Twitch chat client
const createTwitchClient = () => {
    // Check if TMI.js is loaded and available globally
    if (typeof window.tmi === 'undefined') {
        console.error('TMI.js not loaded! Retrying in 1 second...');
        // Retry after a delay
        setTimeout(createTwitchClient, 1000);
        return null;
    }

    console.log('Creating Twitch client...');
    const client = new window.tmi.client({
        connection: {
            secure: true,
            reconnect: true
        },
        channels: ['nymn']
    });

    // Register event handlers
    client.on('message', onMessageHandler);
    client.on('connected', onConnectedHandler);

    return client;
};