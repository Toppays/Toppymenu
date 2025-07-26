// netlify/functions/send-telegram-order.js

const axios = require('axios'); // Para hacer peticiones HTTP (instalarás esto después)

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed'
        };
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Guardado de forma segura en Netlify
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;     // Guardado de forma segura en Netlify

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('Missing Telegram Bot Token or Chat ID in environment variables.');
        return {
            statusCode: 500,
            body: 'Server configuration error.'
        };
    }

    try {
        const { message, total, items } = JSON.parse(event.body); // La información que enviará tu menú

        // Formatear el mensaje para Telegram
        let telegramMessage = `*🚨 ¡NUEVO PEDIDO TÖPPÄYS! 🚨*\n\n`;
        telegramMessage += `*Detalles del Pedido:*\n`;
        items.forEach(item => {
            telegramMessage += `• ${item.name} x ${item.quantity} ($${item.subtotal.toFixed(2)})\n`;
        });
        telegramMessage += `\n*TOTAL: $${total.toFixed(2)}*\n\n`;
        telegramMessage += `_Cliente ha iniciado WhatsApp contigo._`; // Para recordarte que el cliente te escribió

        const telegramApiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        await axios.post(telegramApiUrl, {
            chat_id: CHAT_ID,
            text: telegramMessage,
            parse_mode: 'Markdown' // Para que el texto se vea en negrita, etc.
        });

        return {
            statusCode: 200,
            body: 'Order sent to Telegram successfully!'
        };

    } catch (error) {
        console.error('Error processing order or sending to Telegram:', error);
        return {
            statusCode: 500,
            body: 'Failed to process order or send to Telegram.'
        };
    }
};