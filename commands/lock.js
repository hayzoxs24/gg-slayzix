const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

function getConfig() {
  try { return JSON.parse(fs.readFileSync('./config.json', 'utf8')); } catch (_) { return {}; }
}

module.exports = {
  name: 'lock',
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
        SendMessages: false
      });
      
      const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('🔒 Salon verrouillé')
        .setDescription(`Ce salon a été verrouillé. Les membres ne peuvent plus écrire.`)
        .addFields(
          { name: 'Salon', value: `${message.channel}`, inline: true },
          { name: 'Verrouillé par', value: `${message.author}`, inline: true }
        )
        .setFooter({ text: 'Utilisez +unlock pour déverrouiller' })
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de verrouiller ce salon.')
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  }
};
