const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

function getConfig() {
  try { return JSON.parse(fs.readFileSync('./config.json', 'utf8')); } catch (_) { return {}; }
}

module.exports = {
  name: 'alladmin',
  async execute(message) {
    if (!message.guild) return;
    
    const config = getConfig();
    const managers = config.managers || [];
    
    if (managers.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle('📋 Liste des gérants')
        .setDescription('Aucun gérant configuré.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('👑 Liste des gérants')
      .setDescription(`**Total:** ${managers.length} gérant(s)`)
      .setTimestamp();

    for (const managerId of managers) {
      try {
        const user = await message.client.users.fetch(managerId);
        embed.addFields({
          name: `${user.tag}`,
          value: `ID: \`${user.id}\``,
          inline: false
        });
        
        if (embed.data.fields.length === 1) {
          embed.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }));
        }
      } catch (error) {
        embed.addFields({
          name: `Utilisateur inconnu`,
          value: `ID: \`${managerId}\` (utilisateur introuvable)`,
          inline: false
        });
      }
    }

    message.reply({ embeds: [embed] });
  }
};
