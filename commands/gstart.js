const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'gstart',
  execute(message, args, client) {
    if (args.length < 3) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Format: `+gstart <durée> <gagnants> <prix>`\n**Exemple:** `+gstart 1h 1 Nitro Discord`');
      return message.reply({ embeds: [embed] });
    }

    const duration = args[0];
    const winners = parseInt(args[1]);
    const prize = args.slice(2).join(' ');

    if (isNaN(winners) || winners < 1) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Le nombre de gagnants doit être un nombre valide supérieur à 0.');
      return message.reply({ embeds: [embed] });
    }

    // Convertir la durée en millisecondes
    let durationMs = 0;
    const timeRegex = /(\d+)([smhd])/g;
    let match;
    
    while ((match = timeRegex.exec(duration)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 's': durationMs += value * 1000; break;
        case 'm': durationMs += value * 60 * 1000; break;
        case 'h': durationMs += value * 60 * 60 * 1000; break;
        case 'd': durationMs += value * 24 * 60 * 60 * 1000; break;
      }
    }

    if (durationMs === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Format de durée invalide. Utilisez: s (secondes), m (minutes), h (heures), d (jours)\n**Exemple:** `1h`, `30m`, `2d`');
      return message.reply({ embeds: [embed] });
    }

    const endTime = Date.now() + durationMs;
    const giveawayId = Date.now().toString();

    const embed = new EmbedBuilder()
      .setColor('#ff6b6b')
      .setTitle('🎉 NOUVEAU GIVEAWAY!')
      .setDescription(`**Prix:** ${prize}\n**Gagnants:** ${winners}\n**Participants:** 0\n**Fin:** <t:${Math.floor(endTime / 1000)}:R>\n\nCliquez sur le bouton pour participer!`)
      .setTimestamp()
      .setFooter({ text: `ID: ${giveawayId}` });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway_${giveawayId}`)
          .setLabel('🎉 Participer')
          .setStyle(ButtonStyle.Primary)
      );

    message.channel.send({ embeds: [embed], components: [row] }).then(msg => {
      // Sauvegarder le giveaway
      const giveaways = JSON.parse(fs.readFileSync('./data/giveaways.json', 'utf8') || '{}');
      giveaways[giveawayId] = {
        messageId: msg.id,
        channelId: message.channel.id,
        guildId: message.guild.id,
        prize: prize,
        winners: winners,
        endTime: endTime,
        participants: [],
        ended: false
      };
      fs.writeFileSync('./data/giveaways.json', JSON.stringify(giveaways, null, 2));

      // Programmer la fin du giveaway
      setTimeout(() => {
        const command = require('./gend');
        command.endGiveaway(giveawayId, client);
      }, durationMs);
    });

    message.delete().catch(() => {});
  }
};
