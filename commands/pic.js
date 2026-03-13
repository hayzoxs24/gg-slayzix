const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'pic',
  execute(message, args, client) {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🖼️ Photo de profil de ${user.tag}`)
      .setImage(user.displayAvatarURL({ size: 512 }))
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
