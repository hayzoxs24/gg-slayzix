const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  execute(message, args, client) {
    const guild = message.guild;
    const owner = guild.members.cache.get(guild.ownerId);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📊 Informations du serveur: ${guild.name}`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: '👑 Propriétaire', value: owner ? owner.user.tag : 'Inconnu', inline: true },
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '👥 Membres', value: `${guild.memberCount}`, inline: true },
        { name: '🤖 Bots', value: `${guild.members.cache.filter(m => m.user.bot).size}`, inline: true },
        { name: '📝 Salons', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '📈 Boost', value: `Niveau ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
        { name: '🌍 Région', value: guild.preferredLocale || 'Non définie', inline: true }
      )
      .setTimestamp();

    if (guild.bannerURL()) {
      embed.setImage(guild.bannerURL({ size: 512 }));
    }

    message.reply({ embeds: [embed] });
  }
};
