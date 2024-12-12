const express = require('express');
const app = express();

// Leitor de QR Code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js');

// Configuração para Puppeteer com opções de sandbox desativadas
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Serviço de leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Após a conexão
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Inicializa tudo
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função para criar o delay entre ações

// Funil
client.on('message', async msg => {
    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|bom|Bom)/i) && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); // Delay de 1 segundo
        await chat.sendStateTyping(); // Simula digitação
        await delay(1000);
        const contact = await msg.getContact(); // Pegando o contato
        const name = contact.pushname; // Nome do contato
        await client.sendMessage(
            msg.from,
            `Olá! ${name.split(" ")[0]}, selecione a opção abaixo para agendar seu corte!: \n\n1 - Agendar Corte`
        );
        await delay(1000);
        await chat.sendStateTyping();
        await delay(1000);
    }

    if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(1000); // Delay de 1 segundo
        await chat.sendStateTyping();
        await delay(1000);
        await client.sendMessage(msg.from, 'Link para cadastro: https://calendar.app.google/zz7Qj3Jowi166eCP8');
        await client.sendMessage(msg.from, 'Localização do salão: https://www.google.com/maps?q=37.7749,-122.4194');
    }
});

// Servidor Express
app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor rodando na porta 3000');
});
