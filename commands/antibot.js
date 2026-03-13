const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antibot',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antibot || false;
      antiData[guildId].antibot = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antibot ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Bot ${antiData[guildId].antibot ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antibot ? 
          'Le système anti-bot est maintenant activé. Les nouveaux bots seront automatiquement bannis.' :
          'Le système anti-bot est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-bot:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-bot.');
      message.reply({ embeds: [embed] });
    }
  }
};
