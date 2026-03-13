const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

function getConfig() {
  try { return JSON.parse(fs.readFileSync('./config.json', 'utf8')); } catch (_) { return {}; }
}

module.exports = {
  name: 'hide',
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
        ViewChannel: false
      });
      
      const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('👁️ Salon masqué')
        .setDescription(`Ce salon a été masqué. Seuls les membres avec permissions peuvent le voir.`)
        .addFields(
          { name: 'Salon', value: `${message.channel}`, inline: true },
          { name: 'Masqué par', value: `${message.author}`, inline: true }
        )
        .setFooter({ text: 'Utilisez +unhide pour rendre visible' })
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de masquer ce salon.')
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  }
};
