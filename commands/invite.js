const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'invite',
  execute(message, args, client) {
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🤖 Inviter Casino Queen Bot')
      .setDescription('Cliquez sur le bouton ci-dessous pour inviter le bot sur votre serveur!')
      .addFields(
        { name: '✨ Fonctionnalités', value: '• Système de giveaway\n• Commandes d\'information\n• Système anti-raid\n• Logs automatiques\n• Et bien plus!', inline: false },
        { name: '🔧 Permissions requises', value: '• Gérer les messages\n• Gérer les rôles\n• Gérer les salons\n• Voir les salons', inline: false }
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Inviter le bot')
          .setStyle(ButtonStyle.Link)
          .setURL(inviteUrl)
      );

    message.reply({ embeds: [embed], components: [row] });
  }
};
