const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'allbans',
  execute(message, args, client) {
    message.guild.bans.fetch().then(bans => {
      if (bans.size === 0) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('🚫 Aucun bannissement')
          .setDescription('Aucun membre n\'est banni de ce serveur.');
        return message.reply({ embeds: [embed] });
      }

      const banList = bans.map(ban => `**${ban.user.tag}** (${ban.user.id})\nRaison: ${ban.reason || 'Aucune raison'}`).slice(0, 10);
      
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle(`🚫 Membres bannis (${bans.size})`)
        .setDescription(banList.join('\n\n'))
        .setTimestamp();

      if (bans.size > 10) {
        embed.setFooter({ text: `Affichage de 10 sur ${bans.size} bannissements` });
      }

      message.reply({ embeds: [embed] });
    }).catch(error => {
      console.error('Erreur lors de la récupération des bannissements:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de récupérer la liste des bannissements.');
      message.reply({ embeds: [embed] });
    });
  }
};
