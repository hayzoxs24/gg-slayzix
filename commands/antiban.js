const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antiban',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antiban || false;
      antiData[guildId].antiban = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antiban ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Ban ${antiData[guildId].antiban ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antiban ? 
          'Le système anti-ban est maintenant activé. Les tentatives de bannissement seront bloquées.' :
          'Le système anti-ban est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-ban:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-ban.');
      message.reply({ embeds: [embed] });
    }
  }
};
