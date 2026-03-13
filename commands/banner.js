const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'banner',
  execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;

    if (!user.bannerURL()) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Aucune bannière')
        .setDescription(`${user.tag} n'a pas de bannière.`);
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🖼️ Bannière de ${user.tag}`)
      .setImage(user.bannerURL({ size: 512 }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
