// Chat container reference
const chatContainer = document.getElementById('chat-container');

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