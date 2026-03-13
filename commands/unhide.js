const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

function getConfig() {
  try { return JSON.parse(fs.readFileSync('./config.json', 'utf8')); } catch (_) { return {}; }
}

module.exports = {
  name: 'unhide',
  async execute(message) {
    if (!message.guild) return;
    
    const config = getConfig();
    const isManager = config.managers?.includes(message.author.id) || message.member.permissions.has(PermissionFlagsBits.ManageChannels);
    
    if (!isManager) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Permission refusée')
        .setDescription('Vous devez être gérant ou avoir la permission de gérer les salons.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    try {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        ViewChannel: null
      });
      
      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('👁️ Salon visible')
        .setDescription(`Ce salon est maintenant visible par tous les membres.`)
        .addFields(
          { name: 'Salon', value: `${message.channel}`, inline: true },
          { name: 'Rendu visible par', value: `${message.author}`, inline: true }
        )
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de rendre ce salon visible.')
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  }
};
