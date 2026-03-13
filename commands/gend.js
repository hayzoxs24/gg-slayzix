const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'gend',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez fournir l\'ID du giveaway à terminer.\n**Exemple:** `+gend 1234567890`');
      return message.reply({ embeds: [embed] });
    }

    const giveawayId = args[0];
    this.endGiveaway(giveawayId, client);
  },

  async endGiveaway(giveawayId, client) {
    try {
      const giveaways = JSON.parse(fs.readFileSync('./data/giveaways.json', 'utf8') || '{}');
      const giveaway = giveaways[giveawayId];

      if (!giveaway || giveaway.ended) {
        return;
      }

      const guild = client.guilds.cache.get(giveaway.guildId);
      if (!guild) return;

      const channel = guild.channels.cache.get(giveaway.channelId);
      if (!channel) return;

      const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
      if (!message) return;

      giveaway.ended = true;
      fs.writeFileSync('./data/giveaways.json', JSON.stringify(giveaways, null, 2));

      if (giveaway.participants.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#ff6b6b')
          .setTitle('🎉 GIVEAWAY TERMINÉ!')
          .setDescription(`**Prix:** ${giveaway.prize}\n**Gagnants:** ${giveaway.winners}\n**Participants:** 0\n\n❌ **Aucun participant!**`)
          .setTimestamp()
          .setFooter({ text: `ID: ${giveawayId}` });


        message.edit({ embeds: [embed], components: [] });
        return;
      }

      const winners = [];
      const shuffled = [...giveaway.participants].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < Math.min(giveaway.winners, shuffled.length); i++) {
        winners.push(shuffled[i]);
      }

      const winnerMentions = winners.map(id => `<@${id}>`).join(', ');

      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🎉 GIVEAWAY TERMINÉ!')
        .setDescription(`**Prix:** ${giveaway.prize}\n**Participants:** ${giveaway.participants.length}\n**Gagnants:** ${winnerMentions}\n\nFélicitations aux gagnants! 🎊`)
        .setTimestamp()
        .setFooter({ text: `ID: ${giveawayId}` });

      message.edit({ embeds: [embed], components: [] });
      
      // Mentionner les gagnants
      channel.send(`🎉 **Félicitations ${winnerMentions}!** Vous avez gagné: **${giveaway.prize}**!`);
    } catch (error) {
      console.error('Erreur lors de la fin du giveaway:', error);
    }
  }
};
