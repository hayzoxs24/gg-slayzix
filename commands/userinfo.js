const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'userinfo',
  execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    if (!member) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Utilisateur introuvable sur ce serveur.');
      return message.reply({ embeds: [embed] });
    }

    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .map(role => role.toString())
      .slice(0, 10)
      .join(', ') || 'Aucun rôle';

    const embed = new EmbedBuilder()
      .setColor(member.displayHexColor || '#0099ff')
      .setTitle(`👤 Informations: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 Compte créé', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '📅 Rejoint le serveur', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
        { name: '🎭 Rôles', value: roles.length > 1024 ? roles.substring(0, 1021) + '...' : roles, inline: false },
        { name: '🤖 Bot', value: user.bot ? 'Oui' : 'Non', inline: true },
        { name: '📱 Statut', value: member.presence?.status || 'Hors ligne', inline: true }
      )
      .setTimestamp();

    if (user.bannerURL()) {
      embed.setImage(user.bannerURL({ size: 512 }));
    }

    message.reply({ embeds: [embed] });
  }
};
