const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'greroll',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez fournir l\'ID du giveaway à reroll.\n**Exemple:** `+greroll 1234567890`');
      return message.reply({ embeds: [embed] });
    }

    const giveawayId = args[0];

    try {
      const giveaways = JSON.parse(fs.readFileSync('./data/giveaways.json', 'utf8') || '{}');
      const giveaway = giveaways[giveawayId];

      if (!giveaway) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Giveaway introuvable.');
        return message.reply({ embeds: [embed] });
      }

      if (!giveaway.ended) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Ce giveaway n\'est pas encore terminé.');
        return message.reply({ embeds: [embed] });
      }

      if (giveaway.participants.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Aucun participant dans ce giveaway.');
        return message.reply({ embeds: [embed] });
      }

      const winners = [];
      const shuffled = [...giveaway.participants].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < Math.min(giveaway.winners, shuffled.length); i++) {
        winners.push(shuffled[i]);
      }

      const winnerMentions = winners.map(id => `<@${id}>`).join(', ');

      message.channel.send(`🎉 **Nouveaux gagnants ${winnerMentions}!** Vous avez gagné: **${giveaway.prize}**!`);
    } catch (error) {
      console.error('Erreur lors du reroll:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors du reroll.');
      message.reply({ embeds: [embed] });
    }
  }
};
