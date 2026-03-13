const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Latence API', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Latence Bot', value: `${Date.now() - message.createdTimestamp}ms`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
