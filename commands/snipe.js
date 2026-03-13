const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'snipe',
  async execute(message, args, client) {
    try {
      const snipes = JSON.parse(fs.readFileSync('./data/snipes.json', 'utf8') || '{}');
      const channelSnipes = snipes[message.channel.id];

      if (!channelSnipes || !channelSnipes.length) {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Aucun message supprimé')
          .setDescription('Aucun message supprimé trouvé dans ce salon.');
        return message.reply({ embeds: [embed] });
      }

      const latestSnipe = channelSnipes[channelSnipes.length - 1];
      let user = client.users.cache.get(latestSnipe.authorId);
      if (!user) {
        try { user = await client.users.fetch(latestSnipe.authorId); } catch (_) {}
      }

      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🔍 Dernier message supprimé')
        .setDescription(`**Auteur:** ${user ? user.tag : 'Utilisateur inconnu'}\n**Contenu:** ${latestSnipe.content && latestSnipe.content.length ? latestSnipe.content : '*Aucun contenu*'}\n**Supprimé:** <t:${Math.floor(latestSnipe.deletedAt / 1000)}:R>`)
        .setTimestamp();

      if (latestSnipe.attachments && latestSnipe.attachments.length > 0) {
        embed.addFields({ name: 'Pièces jointes', value: latestSnipe.attachments.map(att => `[${att.name}](${att.url})`).join('\n'), inline: false });
      }

      if (user) {
        embed.setThumbnail(user.displayAvatarURL());
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors du snipe:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la récupération du message supprimé.');
      message.reply({ embeds: [embed] });
    }
  }
};
