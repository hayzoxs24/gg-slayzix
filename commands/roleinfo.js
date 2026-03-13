const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'roleinfo',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez mentionner un rôle ou fournir son ID.\n**Exemple:** `+roleinfo @Membre` ou `+roleinfo 1234567890`');
      return message.reply({ embeds: [embed] });
    }

    const roleInput = args[0];
    const role = message.mentions.roles.first() || message.guild.roles.cache.get(roleInput);

    if (!role) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Rôle introuvable.');
      return message.reply({ embeds: [embed] });
    }

    const members = role.members.size;
    const permissions = role.permissions.toArray().slice(0, 10).join(', ') || 'Aucune permission spéciale';

    const embed = new EmbedBuilder()
      .setColor(role.color || '#0099ff')
      .setTitle(`🎭 Informations du rôle: ${role.name}`)
      .addFields(
        { name: '🆔 ID', value: role.id, inline: true },
        { name: '👥 Membres', value: `${members}`, inline: true },
        { name: '🎨 Couleur', value: role.hexColor, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`, inline: true },
        { name: '📍 Position', value: `${role.position}`, inline: true },
        { name: '🔒 Mentionnable', value: role.mentionable ? 'Oui' : 'Non', inline: true },
        { name: '⚙️ Permissions', value: permissions.length > 1024 ? permissions.substring(0, 1021) + '...' : permissions, inline: false }
      )
      .setTimestamp();

    if (role.iconURL()) {
      embed.setThumbnail(role.iconURL());
    }

    message.reply({ embeds: [embed] });
  }
};
