const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

function getConfig() {
  try { return JSON.parse(fs.readFileSync('./config.json', 'utf8')); } catch (_) { return {}; }
}

function saveConfig(config) {
  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
}

module.exports = {
  name: 'derankadmin',
  async execute(message, args) {
    if (!message.guild) return;
    
    const config = getConfig();
    const isManager = config.managers?.includes(message.author.id);
    
    if (!isManager) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Permission refusée')
        .setDescription('Seuls les gérants peuvent retirer d\'autres gérants.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (args.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle('⚠️ Usage incorrect')
        .setDescription('**Usage:** `+derankadmin {id ou @user}`\n**Exemple:** `+derankadmin @User` ou `+derankadmin 123456789`')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    let userId = args[0].replace(/[<@!>]/g, '');
    
    if (userId === message.author.id) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Action impossible')
        .setDescription('Vous ne pouvez pas vous retirer vous-même des gérants.')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }
    
    try {
      const user = await message.client.users.fetch(userId);
      
      if (!config.managers) config.managers = [];
      
      if (!config.managers.includes(user.id)) {
        const embed = new EmbedBuilder()
          .setColor('#f39c12')
          .setTitle('⚠️ Pas gérant')
          .setDescription(`**${user.tag}** n'est pas gérant.`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }
      
      config.managers = config.managers.filter(id => id !== user.id);
      saveConfig(config);
      
      const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('✅ Gérant retiré')
        .setDescription(`**${user.tag}** a été retiré des gérants.`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'ID', value: `\`${user.id}\``, inline: true },
          { name: 'Total gérants', value: `${config.managers.length}`, inline: true }
        )
        .setFooter({ text: `Par ${message.author.tag}` })
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('❌ Utilisateur introuvable')
        .setDescription('Impossible de trouver cet utilisateur.')
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  }
};
