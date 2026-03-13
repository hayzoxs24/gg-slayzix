const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

function getConfig() {
  try { return JSON.parse(fs.readFileSync('./config.json', 'utf8')); } catch (_) { return {}; }
}

module.exports = {
  name: 'rename',
  async execute(message, args) {
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

    if (args.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle('⚠️ Usage incorrect')
        .setDescription('**Usage:** `+rename {nom du salon}`\n**Exemple:** `+rename nouveau-salon`')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const newName = args.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    if (!newName) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Nom invalide')
        .setDescription('Le nom du salon doit contenir au moins un caractère alphanumérique.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    try {
      const oldName = message.channel.name;
      await message.channel.setName(newName);
      
      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('✅ Salon renommé')
        .setDescription(`**Ancien nom:** ${oldName}\n**Nouveau nom:** ${newName}`)
        .setFooter({ text: `Par ${message.author.tag}` })
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de renommer ce salon.')
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  }
};
