const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antiupdate',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antiupdate || false;
      antiData[guildId].antiupdate = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antiupdate ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Update ${antiData[guildId].antiupdate ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antiupdate ? 
          'Le système anti-update est maintenant activé. Les mises à jour du serveur seront surveillées.' :
          'Le système anti-update est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-update:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-update.');
      message.reply({ embeds: [embed] });
    }
  }
};
