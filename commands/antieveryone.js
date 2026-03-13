const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antieveryone',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antieveryone || false;
      antiData[guildId].antieveryone = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antieveryone ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Everyone ${antiData[guildId].antieveryone ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antieveryone ? 
          'Le système anti-everyone est maintenant activé. Les mentions @everyone seront bloquées.' :
          'Le système anti-everyone est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-everyone:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-everyone.');
      message.reply({ embeds: [embed] });
    }
  }
};
