const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'emoji',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez fournir un emoji à copier.\n**Exemple:** `+emoji 😀` ou `+emoji :smile:`');
      return message.reply({ embeds: [embed] });
    }

    const emojiInput = args[0];
    let emoji = null;

    // Vérifier si c'est un emoji personnalisé Discord
    const customEmojiMatch = emojiInput.match(/<a?:(\w+):(\d+)>/);
    if (customEmojiMatch) {
      const [, name, id] = customEmojiMatch;
      const animated = emojiInput.startsWith('<a:');
      emoji = {
        name: name,
        id: id,
        animated: animated,
        url: `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`
      };
    } else {
      // Vérifier si c'est un emoji Unicode
      const unicodeEmojiMatch = emojiInput.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
      if (unicodeEmojiMatch) {
        emoji = {
          name: emojiInput,
          unicode: true
        };
      }
    }

    if (!emoji) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Emoji introuvable. Assurez-vous que l\'emoji existe sur ce serveur ou utilisez un emoji Unicode.');
      return message.reply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📋 Emoji Copié')
      .addFields(
        { name: 'Nom', value: emoji.name, inline: true },
        { name: 'Type', value: emoji.unicode ? 'Unicode' : 'Personnalisé', inline: true }
      )
      .setTimestamp();

    if (emoji.url) {
      embed.setThumbnail(emoji.url);
      embed.addFields({ name: 'URL', value: `[Cliquer ici](${emoji.url})`, inline: false });
    } else {
      embed.setDescription(`**Emoji:** ${emoji.name}`);
    }

    message.reply({ embeds: [embed] });
  }
};
