const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'calc',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez fournir une expression mathématique à calculer.\n**Exemple:** `+calc 2+2` ou `+calc 10*5`');
      return message.reply({ embeds: [embed] });
    }

    try {
      const expression = args.join(' ').replace(/[^0-9+\-*/().\s]/g, '');
      const result = eval(expression);
      
      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Résultat invalide');
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🧮 Calculatrice')
        .addFields(
          { name: 'Expression', value: `\`${expression}\``, inline: true },
          { name: 'Résultat', value: `\`${result}\``, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Expression mathématique invalide. Veuillez utiliser uniquement des nombres et des opérateurs (+, -, *, /, parentheses).');
      message.reply({ embeds: [embed] });
    }
  }
};
