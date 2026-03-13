const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Supprime un certain nombre de messages du salon.',
  async execute(message, args) {
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply("⚠️ Entre un nombre valide entre **1 et 100** !");
    }

    try {
      const deletedMessages = await message.channel.bulkDelete(amount, true);

      const embed = new EmbedBuilder()
        .setColor('#00ff99')
        .setTitle('🧹 Nettoyage effectué')
        .setDescription(`✅ ${deletedMessages.size} message(s) supprimé(s) avec succès !`)
        .setFooter({ text: `Demandé par ${message.author.tag}` })
        .setTimestamp();

      const confirmMessage = await message.channel.send({ embeds: [embed] });
      setTimeout(() => confirmMessage.delete().catch(() => {}), 5000);
    } catch (error) {
      console.error('Erreur clear:', error);
      message.reply("❌ Impossible de supprimer les messages (trop anciens ou erreur inconnue).");
    }
  },
};
