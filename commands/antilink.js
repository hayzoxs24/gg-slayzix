const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antilink',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antilink || false;
      antiData[guildId].antilink = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antilink ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Link ${antiData[guildId].antilink ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antilink ? 
          'Le système anti-link est maintenant activé. Les liens seront automatiquement supprimés.' :
          'Le système anti-link est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-link:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-link.');
      message.reply({ embeds: [embed] });
    }
  }
};
