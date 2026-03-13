const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'leave',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez fournir l\'ID du serveur à quitter.\n**Exemple:** `+leave 1234567890`');
      return message.reply({ embeds: [embed] });
    }

    const guildId = args[0];
    const guild = client.guilds.cache.get(guildId);

    if (!guild) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Serveur introuvable.');
      return message.reply({ embeds: [embed] });
    }

    guild.leave().then(() => {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Serveur quitté')
        .setDescription(`Le bot a quitté le serveur **${guild.name}**.`)
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    }).catch(error => {
      console.error('Erreur lors de la sortie du serveur:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de quitter le serveur.');
      message.reply({ embeds: [embed] });
    });
  }
};
