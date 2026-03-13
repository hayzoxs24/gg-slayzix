// bot.js
const { Client, GatewayIntentBits } = require('discord.js');

// Crée le client Discord avec les permissions nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Préfixe de la commande
const prefix = "+";

// Événement quand le bot est prêt
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// Événement quand un message est envoyé
client.on('messageCreate', message => {
    // Ignore les messages de bots
    if (message.author.bot) return;

    // Vérifie que le message commence par le préfixe
    if (!message.content.startsWith(prefix)) return;

    // Récupère la commande
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Commande +hayzoxs
    if (command === 'hayzoxs') {
        // Message invisible via spoiler Discord
        message.channel.send(`||Voici le message invisible||`);
    }
});

// Connecte le bot avec ton token
client.login('TON_TOKEN_ICI');
