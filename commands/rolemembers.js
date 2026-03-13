const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'rolemembers',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez mentionner un rôle ou fournir son ID.\n**Exemple:** `+rolemembers @Membre` ou `+rolemembers 1234567890`');
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

    const members = role.members.map(member => member.user.tag).slice(0, 20);
    
    if (members.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Aucun membre')
        .setDescription(`Aucun membre n'a le rôle ${role.name}.`);
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(role.color || '#0099ff')
      .setTitle(`👥 Membres du rôle: ${role.name} (${role.members.size})`)
      .setDescription(members.join('\n'))
      .setTimestamp();

    if (role.members.size > 20) {
      embed.setFooter({ text: `Affichage de 20 sur ${role.members.size} membres` });
    }

    message.reply({ embeds: [embed] });
  }
};
