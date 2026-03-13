const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'voicemove',
  execute(message, args, client) {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Veuillez mentionner un membre ou fournir son ID.\n**Exemple:** `+voicemove @utilisateur` ou `+voicemove 1234567890`');
      return message.reply({ embeds: [embed] });
    }

    const memberInput = args[0];
    const member = message.mentions.members.first() || message.guild.members.cache.get(memberInput);

    if (!member) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Membre introuvable.');
      return message.reply({ embeds: [embed] });
    }

    if (!member.voice.channel) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription(`${member.user.tag} n'est pas dans un salon vocal.`);
      return message.reply({ embeds: [embed] });
    }

    if (!message.member.voice.channel) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Vous devez être dans un salon vocal pour utiliser cette commande.');
      return message.reply({ embeds: [embed] });
    }

    member.voice.setChannel(message.member.voice.channel).then(() => {
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Membre déplacé')
        .setDescription(`${member.user.tag} a été déplacé vers ${message.member.voice.channel.name}.`)
        .setTimestamp();
      
      message.reply({ embeds: [embed] });
    }).catch(error => {
      console.error('Erreur lors du déplacement vocal:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Impossible de déplacer le membre.');
      message.reply({ embeds: [embed] });
    });
  }
};
