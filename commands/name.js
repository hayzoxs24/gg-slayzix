const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'name',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez fournir un nouveau nom pour le bot.\n**Exemple:** `+name Mon Nouveau Bot`');
      return message.reply({ embeds: [embed] });
    }

    const newName = args.join(' ');

    if (newName.length > 32) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Le nom ne peut pas dépasser 32 caractères.');
      return message.reply({ embeds: [embed] });
    }

    client.user.setUsername(newName).then(() => {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Nom changé')
        .setDescription(`Le nom du bot a été changé en **${newName}**.`)
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    }).catch(error => {
      console.error('Erreur lors du changement de nom:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de changer le nom du bot.');
      message.reply({ embeds: [embed] });
    });
  }
};
