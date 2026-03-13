const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antichannel',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antichannel || false;
      antiData[guildId].antichannel = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antichannel ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Channel ${antiData[guildId].antichannel ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antichannel ? 
          'Le système anti-channel est maintenant activé. La création/suppression de salons sera surveillée.' :
          'Le système anti-channel est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-channel:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-channel.');
      message.reply({ embeds: [embed] });
    }
  }
};
