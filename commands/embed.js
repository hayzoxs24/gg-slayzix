const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'embed',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez fournir les paramètres de l\'embed.\n**Format:** `+embed <titre> | <description> | <couleur>`\n**Exemple:** `+embed Mon titre | Ma description | #ff0000`');
      return message.reply({ embeds: [embed] });
    }

    const content = args.join(' ');
    const parts = content.split(' | ');

    if (parts.length < 2) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Format invalide. Utilisez: `+embed <titre> | <description> | <couleur>`');
      return message.reply({ embeds: [embed] });
    }

    const title = parts[0];
    const description = parts[1];
    const color = parts[2] || '#0099ff';

    try {
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: `Créé par ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      message.channel.send({ embeds: [embed] });
      message.delete().catch(() => {});
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de créer l\'embed. Vérifiez le format de la couleur (ex: #ff0000).');
      message.reply({ embeds: [embed] });
    }
  }
};
