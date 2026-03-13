const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'setuplog',
  execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🔧 Configuration des Logs')
      .setDescription('Configurez les salons de logs pour votre serveur. Cliquez sur les boutons ci-dessous pour configurer chaque type de log.')
      .addFields(
        { name: '📝 Messages', value: 'Logs des messages supprimés/modifiés', inline: true },
        { name: '👥 Membres', value: 'Logs des arrivées/départs', inline: true },
        { name: '🎭 Rôles', value: 'Logs des rôles ajoutés/supprimés', inline: true },
        { name: '🔊 Vocal', value: 'Logs des connexions/déconnexions vocales', inline: true },
        { name: '💎 Boost', value: 'Logs des boosts du serveur', inline: true },
        { name: '🛡️ Modération', value: 'Logs des sanctions (ban, kick, etc.)', inline: true },
        { name: '🚨 Raid', value: 'Logs des tentatives de raid', inline: true },
        { name: '📢 Annonces', value: 'Logs des annonces importantes', inline: true },
        { name: '⚙️ Système', value: 'Logs du système et erreurs', inline: true }
      )
      .setTimestamp();

    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('log_messages')
          .setLabel('📝 Messages')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('log_members')
          .setLabel('👥 Membres')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('log_roles')
          .setLabel('🎭 Rôles')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('log_voice')
          .setLabel('🔊 Vocal')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('log_boost')
          .setLabel('💎 Boost')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('log_moderation')
          .setLabel('🛡️ Modération')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('log_raid')
          .setLabel('🚨 Raid')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('log_announcements')
          .setLabel('📢 Annonces')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('log_system')
          .setLabel('⚙️ Système')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('log_reset')
          .setLabel('🔄 Reset')
          .setStyle(ButtonStyle.Secondary)
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('log_autosetup')
          .setLabel('✨ Auto-Setup')
          .setStyle(ButtonStyle.Success)
      );

    message.reply({ embeds: [embed], components: [row1, row2, row3] });
  }
};
