const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'allbots',
  execute(message, args, client) {
    const bots = message.guild.members.cache.filter(member => member.user.bot);
    
    if (bots.size === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🤖 Aucun bot')
        .setDescription('Aucun bot trouvé sur ce serveur.');
      return message.reply({ embeds: [embed] });
    }

    const botList = bots.map(bot => `**${bot.user.tag}** (${bot.user.id})`).slice(0, 20);
    
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🤖 Bots du serveur (${bots.size})`)
      .setDescription(botList.join('\n'))
      .setTimestamp();

    if (bots.size > 20) {
      embed.setFooter({ text: `Affichage de 20 sur ${bots.size} bots` });
    }

    message.reply({ embeds: [embed] });
  }
};
