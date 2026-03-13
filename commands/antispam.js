const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'antispam',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      
      if (!antiData[guildId]) {
        antiData[guildId] = {};
      }
      
      const currentState = antiData[guildId].antispam || false;
      antiData[guildId].antispam = !currentState;
      
      fs.writeFileSync('./data/anti.json', JSON.stringify(antiData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor(antiData[guildId].antispam ? '#00ff00' : '#ff0000')
        .setTitle(`🛡️ Anti-Spam ${antiData[guildId].antispam ? 'Activé' : 'Désactivé'}`)
        .setDescription(antiData[guildId].antispam ? 
          'Le système anti-spam est maintenant activé. Le spam sera automatiquement détecté et sanctionné.' :
          'Le système anti-spam est maintenant désactivé.')
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la modification de l\'anti-spam:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la modification de l\'anti-spam.');
      message.reply({ embeds: [embed] });
    }
  }
};
