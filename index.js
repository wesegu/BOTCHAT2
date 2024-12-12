const express = require('express');
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const app = express();

// Configuração para Puppeteer com opções de sandbox desativadas
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Serviço de leitura do QR Code
client.on('qr', qr => {
    console.log('Exibindo QR Code:');
    qrcode.generate(qr, { small: true });
});

// Após a conexão
client.on('ready', () => {
    console.log('WhatsApp conectado!');
    // Inicia o servidor Express quando o cliente estiver pronto
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Servidor Express rodando na porta ${port}`);
    });
});

// Inicializa o cliente do WhatsApp
client.initialize();

// Delay entre ações
const delay = ms => new Promise(res => setTimeout(res, ms));

// Funil de mensagens
client.on('message', async msg => {
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|bom|Bom)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();

        const name = contact.pushname || 'Cliente'; // Nome do contato (fallback para "Cliente")
        await chat.sendStateTyping();
        await delay(1000);
        await client.sendMessage(
            msg.from,
            `Olá, ${name.split(" ")[0]}! Selecione a opção abaixo para agendar seu corte:\n\n1 - Agendar Corte`
        );
    }

    if (msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        await chat.sendStateTyping();
        await delay(1000);
        await client.sendMessage(msg.from, 'Link para cadastro: https://calendar.app.google/zz7Qj3Jowi166eCP8');
        await client.sendMessage(msg.from, 'Localização do salão: https://www.google.com/maps?q=37.7749,-122.4194');
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.send('Botchat2 está funcionando!');
});
