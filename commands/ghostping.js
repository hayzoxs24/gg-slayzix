const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'ghostping',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez mentionner les salons où configurer le ghostping.\n**Exemple:** `+ghostping #salon1 #salon2`');
      return message.reply({ embeds: [embed] });
    }

    const guildId = message.guild.id;
    const channels = message.mentions.channels;

    if (channels.size === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Aucun salon valide mentionné.');
      return message.reply({ embeds: [embed] });
    }

    try {
      const ghostpingData = JSON.parse(fs.readFileSync('./data/ghostping.json', 'utf8') || '{}');
      
      if (!ghostpingData[guildId]) {
        ghostpingData[guildId] = [];
      }
      
      const channelIds = channels.map(channel => channel.id);
      ghostpingData[guildId] = channelIds;
      
      fs.writeFileSync('./data/ghostping.json', JSON.stringify(ghostpingData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Ghostping configuré')
        .setDescription(`Le ghostping est maintenant configuré pour les salons:\n${channels.map(channel => `• ${channel}`).join('\n')}`)
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la configuration du ghostping:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la configuration du ghostping.');
      message.reply({ embeds: [embed] });
    }
  }
};
