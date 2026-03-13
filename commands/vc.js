const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'vc',
  execute(message, args, client) {
    const guild = message.guild;
    const totalMembers = guild.memberCount;
    const bots = guild.members.cache.filter(member => member.user.bot).size;
    const humans = totalMembers - bots;
    const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
    const voiceMembers = guild.members.cache.filter(member => member.voice.channel).size;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📊 Statistiques de ${guild.name}`)
      .addFields(
        { name: '👥 Total des membres', value: `${totalMembers}`, inline: true },
        { name: '👤 Humains', value: `${humans}`, inline: true },
        { name: '🤖 Bots', value: `${bots}`, inline: true },
        { name: '🟢 En ligne', value: `${onlineMembers}`, inline: true },
        { name: '🔊 En vocal', value: `${voiceMembers}`, inline: true },
        { name: '📝 Salons', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '💎 Boosters', value: `${guild.premiumSubscriptionCount}`, inline: true },
        { name: '📈 Niveau de boost', value: `Niveau ${guild.premiumTier}`, inline: true }
      )
      .setTimestamp()
      .setThumbnail(guild.iconURL());

    message.reply({ embeds: [embed] });
  }
};
