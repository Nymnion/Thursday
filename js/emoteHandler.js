// Store emotes in a Map for O(1) lookup
const emoteMap = new Map();

// Fetch and process channel emotes
async function fetchChannelEmotes() {
    try {
        const response = await fetch('https://7tv.io/v3/users/twitch/62300805');
        const data = await response.json();
        
        data.emote_set.emotes.forEach(emote => {
            const url = `//cdn.7tv.app/emote/${emote.id}/1x.webp`;
            emoteMap.set(emote.name, url);
        });
        
        console.log('✅ Channel emotes loaded:', emoteMap.size);
    } catch (error) {
        console.error('Failed to load channel emotes:', error);
    }
}

// Fetch and process global emotes
async function fetchGlobalEmotes() {
    try {
        const response = await fetch('https://7tv.io/v3/emote-sets/global');
        const data = await response.json();
        
        data.emotes.forEach(emote => {
            const url = `//cdn.7tv.app/emote/${emote.id}/1x.webp`;
            emoteMap.set(emote.name, url);
        });
        
        console.log('✅ Global emotes loaded:', emoteMap.size);
    } catch (error) {
        console.error('Failed to load global emotes:', error);
    }
}

// Initialize all emotes
async function initializeEmotes() {
    await Promise.all([
        fetchChannelEmotes(),
        fetchGlobalEmotes()
    ]);
    console.log('✅ All emotes loaded! Total:', emoteMap.size);
}

// Process a message and replace emote codes with images
function processEmotes(message) {
    return message.split(' ').map(word => {
        if (emoteMap.has(word)) {
            return `<img src="${emoteMap.get(word)}" alt="${word}" class="chat-emote">`;
        }
        return word;
    }).join(' ');
}