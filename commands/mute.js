const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

function getConfig() {
  try { return JSON.parse(fs.readFileSync('./config.json', 'utf8')); } catch (_) { return {}; }
}

function parseDuration(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };
  
  return value * multipliers[unit];
}

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
}

module.exports = {
  name: 'mute',
  async execute(message, args) {
    if (!message.guild) return;
    
    const config = getConfig();
    const isManager = config.managers?.includes(message.author.id) || message.member.permissions.has(PermissionFlagsBits.ModerateMembers);
    
    if (!isManager) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Permission refusée')
        .setDescription('Vous devez être gérant ou avoir la permission de timeout les membres.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (args.length < 2) {
      const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle('⚠️ Usage incorrect')
        .setDescription('**Usage:** `+mute {id ou @user} {durée}`\n**Exemples:**\n• `+mute @User 5m` (5 minutes)\n• `+mute 123456789 3h` (3 heures)\n• `+mute @User 2d` (2 jours)')
        .addFields(
          { name: 'Unités de temps', value: '`s` = secondes\n`m` = minutes\n`h` = heures\n`d` = jours', inline: true }
        )
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    let userId = args[0].replace(/[<@!>]/g, '');
    const duration = parseDuration(args[1]);
    
    if (!duration) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Durée invalide')
        .setDescription('Format de durée invalide. Utilisez: `1s`, `5m`, `3h`, `2d`')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (duration > 28 * 24 * 60 * 60 * 1000) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Durée trop longue')
        .setDescription('La durée maximale est de 28 jours.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    try {
      const member = await message.guild.members.fetch(userId);
      
      if (member.id === message.author.id) {
        const embed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setTitle('❌ Action impossible')
          .setDescription('Vous ne pouvez pas vous timeout vous-même.')
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      if (member.permissions.has(PermissionFlagsBits.Administrator)) {
        const embed = new EmbedBuilder()
          .setColor('#e74c3c')
          .setTitle('❌ Action impossible')
          .setDescription('Impossible de timeout un administrateur.')
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';
      await member.timeout(duration, reason);
      
      const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('🔇 Membre timeout')
        .setDescription(`**${member.user.tag}** a été mis en timeout.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Durée', value: formatDuration(duration), inline: true },
          { name: 'Expire', value: `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`, inline: true },
          { name: 'Raison', value: reason, inline: false }
        )
        .setFooter({ text: `Par ${message.author.tag}` })
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de timeout ce membre. Vérifiez que le bot a les permissions nécessaires et que le membre est sur le serveur.')
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  }
};
