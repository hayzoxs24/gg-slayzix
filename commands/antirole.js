const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antirole',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antirole || false;
      antiData[guildId].antirole = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antirole ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Role ${antiData[guildId].antirole ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antirole ? 
          'Le système anti-role est maintenant activé. La création/suppression de rôles sera surveillée.' :
          'Le système anti-role est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-role:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-role.');
      message.reply({ embeds: [embed] });
    }
  }
};
