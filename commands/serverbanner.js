const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'serverbanner',
  execute(message, args, client) {
    const guild = message.guild;

    if (!guild.bannerURL()) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Aucune bannière')
        .setDescription('Ce serveur n\'a pas de bannière.');
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🖼️ Bannière de ${guild.name}`)
      .setImage(guild.bannerURL({ size: 512 }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
