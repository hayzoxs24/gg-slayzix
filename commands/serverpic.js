const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverpic',
  execute(message, args, client) {
    const guild = message.guild;

    if (!guild.iconURL()) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Aucune icône')
        .setDescription('Ce serveur n\'a pas d\'icône.');
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🖼️ Icône de ${guild.name}`)
      .setImage(guild.iconURL({ size: 512 }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
