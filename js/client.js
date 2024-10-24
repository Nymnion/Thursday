// Create and configure the Twitch chat client
const createTwitchClient = () => {
    const client = new tmi.Client({
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