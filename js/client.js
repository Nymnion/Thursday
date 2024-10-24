// Create and configure the Twitch chat client
const createTwitchClient = () => {
    return new tmi.client({
        channels: ['nymn']
    });
};