const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'servers',
  execute(message, args, client) {
    const servers = client.guilds.cache.map(guild => 
      `**${guild.name}** (${guild.memberCount} membres)`
    ).slice(0, 20);

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🌐 Serveurs (${client.guilds.cache.size})`)
      .setDescription(servers.join('\n'))
      .setTimestamp();

    if (client.guilds.cache.size > 20) {
      embed.setFooter({ text: `Affichage de 20 sur ${client.guilds.cache.size} serveurs` });
    }

    message.reply({ embeds: [embed] });
  }
};
