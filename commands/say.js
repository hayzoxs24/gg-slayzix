const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'say',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez fournir un message à répéter.\n**Exemple:** `+say Bonjour tout le monde!`');
      return message.reply({ embeds: [embed] });
    }

    const text = args.join(' ');
    
    // Supprimer le message de commande
    message.delete().catch(() => {});
    
    // Envoyer le message
    message.channel.send(text);
  }
};
