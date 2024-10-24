// Chat container reference
const chatContainer = document.getElementById('chat-container');

// Default Twitch colors for users who haven't set a color
const DEFAULT_COLORS = [
    '#FF0000', '#0000FF', '#008000', '#B22222', '#FF7F50',
    '#9ACD32', '#FF4500', '#2E8B57', '#DAA520', '#D2691E',
    '#5F9EA0', '#1E90FF', '#FF69B4', '#8A2BE2', '#00FF7F'
];

// Get color for user - either their set color or a consistent generated one
function getUserColor(tags) {
    if (tags.color) {
        return tags.color;
    }
    
    // Generate consistent color based on username
    const hash = tags['display-name'].split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

// Sanitize text content
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle incoming messages
function onMessageHandler(target, context, msg, self) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';

    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'username';
    usernameSpan.textContent = context['display-name'];
    usernameSpan.style.color = getUserColor(context);

    const messageSpan = document.createElement('span');
    messageSpan.className = 'message';
    
    // First sanitize the raw message
    const sanitizedMessage = sanitizeText(msg);
    // Then process emotes on the sanitized message
    messageSpan.innerHTML = processEmotes(sanitizedMessage);

    messageElement.appendChild(usernameSpan);
    messageElement.appendChild(messageSpan);
    chatContainer.appendChild(messageElement);

    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Handle successful connection
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
    const messageElement = document.createElement('div');
    messageElement.textContent = '✅ Connected to chat!';
    messageElement.style.color = '#00ff00';
    chatContainer.appendChild(messageElement);
}