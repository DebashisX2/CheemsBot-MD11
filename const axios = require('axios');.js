const axios = require('axios');

// Function to send a message with multiple buttons
async function sendButtonReplyMessage() {
    target = m.sender
    const messageData = {
        to: target,
        type: 'text',
        text: 'Choose an option:',
        buttons: [
            { type: 'reply', title: 'menu', payload: 'menu' },
            { type: 'reply', title: 'ping', payload: 'ping' },
            { type: 'reply', title: 'owner', payload: 'owner' },
            // Add more buttons as needed
        ]
    };

    try {
        const response = await axios.post('https://api.whatsapp.com/v1/messages', messageData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_AUTH_TOKEN'
            }
        });
        console.log('Message sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending message:', error.response.data);
    }
}

// Call the function to send the message
sendButtonReplyMessage();
