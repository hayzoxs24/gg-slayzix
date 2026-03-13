const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'boosters',
  execute(message, args, client) {
    const boosters = message.guild.members.cache.filter(member => member.premiumSince);
    
    if (boosters.size === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('💎 Aucun booster')
        .setDescription('Aucun membre ne boost ce serveur.');
      return message.reply({ embeds: [embed] });
    }

    const boosterList = boosters.map(booster => 
      `**${booster.user.tag}** - Depuis <t:${Math.floor(booster.premiumSinceTimestamp / 1000)}:R>`
    ).slice(0, 20);
    
    const embed = new EmbedBuilder()
      .setColor('#ff73b7')
      .setTitle(`💎 Boosters du serveur (${boosters.size})`)
      .setDescription(boosterList.join('\n'))
      .setTimestamp();

    if (boosters.size > 20) {
      embed.setFooter({ text: `Affichage de 20 sur ${boosters.size} boosters` });
    }

    message.reply({ embeds: [embed] });
  }
};
