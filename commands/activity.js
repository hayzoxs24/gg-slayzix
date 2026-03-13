const { EmbedBuilder, ActivityType } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'activity',
  execute(message, args, client) {
    if (args.length < 2) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Format: `+activity <type> <texte>`\n**Types:** playing, listening, watching, streaming, competing\n**Exemple:** `+activity playing Mon jeu`');
      return message.reply({ embeds: [embed] });
    }

    const type = args[0].toLowerCase();
    const text = args.slice(1).join(' ');

    let activityType;
    switch (type) {
      case 'playing': activityType = ActivityType.Playing; break;
      case 'listening': activityType = ActivityType.Listening; break;
      case 'watching': activityType = ActivityType.Watching; break;
      case 'streaming': activityType = ActivityType.Streaming; break;
      case 'competing': activityType = ActivityType.Competing; break;
      default:
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Type d\'activité invalide. Types disponibles: playing, listening, watching, streaming, competing');
        return message.reply({ embeds: [embed] });
    }

    client.user.setActivity(text, { type: activityType });

    // Sauvegarder dans la config
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
    config.status = { text: text, type: activityType };
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Activité mise à jour')
      .setDescription(`**Type:** ${type}\n**Texte:** ${text}`)
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
