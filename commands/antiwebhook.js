const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antiwebhook',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antiwebhook || false;
      antiData[guildId].antiwebhook = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antiwebhook ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Webhook ${antiData[guildId].antiwebhook ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antiwebhook ? 
          'Le système anti-webhook est maintenant activé. La création/suppression de webhooks sera surveillée.' :
          'Le système anti-webhook est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-webhook:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-webhook.');
      message.reply({ embeds: [embed] });
    }
  }
};
