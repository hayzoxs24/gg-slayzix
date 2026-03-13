const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'tempvoc',
  execute(message, args, client) {
    if (args.length < 2) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Format: `+tempvoc <off/salon> <catégorie>`\n**Exemple:** `+tempvoc #salon-vocal "Salons Temporaires"`');
      return message.reply({ embeds: [embed] });
    }

    const guildId = message.guild.id;
    const channelInput = args[0];
    const categoryName = args.slice(1).join(' ');

    try {
      const tempvocData = JSON.parse(fs.readFileSync('./data/tempvoc.json', 'utf8') || '{}');
      
      if (!tempvocData[guildId]) {
        tempvocData[guildId] = {};
      }

      if (channelInput.toLowerCase() === 'off') {
        tempvocData[guildId] = {};
        fs.writeFileSync('./data/tempvoc.json', JSON.stringify(tempvocData, null, 2));
        
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Salons vocaux temporaires désactivés')
          .setDescription('Le système de salons vocaux temporaires a été désactivé.')
          .setTimestamp();
        
        return message.reply({ embeds: [embed] });
      }

      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(channelInput);
      
      if (!channel || channel.type !== 2) { // 2 = GUILD_VOICE
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Veuillez mentionner un salon vocal valide.');
        return message.reply({ embeds: [embed] });
      }

      tempvocData[guildId] = {
        channelId: channel.id,
        categoryName: categoryName
      };
      
      fs.writeFileSync('./data/tempvoc.json', JSON.stringify(tempvocData, null, 2));
      
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Salons vocaux temporaires configurés')
        .setDescription(`**Salon:** ${channel}\n**Catégorie:** ${categoryName}`)
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la configuration des salons vocaux temporaires:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la configuration.');
      message.reply({ embeds: [embed] });
    }
  }
};
