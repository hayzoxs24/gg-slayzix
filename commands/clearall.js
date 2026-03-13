const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'clearall',
  description: 'Supprime tous les messages du salon en le recréant à l’identique.',
  async execute(message) {
    const channel = message.channel;

    const confirmEmbed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle('⚠️ Confirmation requise')
      .setDescription('Cette action va **supprimer complètement le salon** et le recréer à l’identique.\n\nRéponds par `oui` pour confirmer ou `non` pour annuler.')
      .setFooter({ text: 'Tu as 20 secondes pour répondre.' });

    await message.reply({ embeds: [confirmEmbed] });

    const filter = (m) => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 20000 });

    if (!collected.size) return message.channel.send('⏰ Temps écoulé. Commande annulée.');
    const response = collected.first().content.toLowerCase();
    if (response !== 'oui') return message.channel.send('❌ Commande annulée.');

    try {
      const position = channel.position;
      const parent = channel.parent;
      const name = channel.name;
      const rateLimit = channel.rateLimitPerUser;
      const topic = channel.topic;
      const nsfw = channel.nsfw;
      const permissionOverwrites = channel.permissionOverwrites.cache.map(perm => perm.toJSON());

      const newChannel = await channel.guild.channels.create({
        name,
        type: channel.type,
        topic,
        nsfw,
        parent: parent?.id || null,
        rateLimitPerUser: rateLimit,
        position,
        permissionOverwrites,
        reason: `Salon recréé à la demande de ${message.author.tag}`,
      });

      await channel.delete('Salon recréé pour clear complet.');

      const embed = new EmbedBuilder()
        .setColor('#00ff99')
        .setTitle('🧹 Salon réinitialisé')
        .setDescription(`✅ Le salon **#${name}** a été recréé à l’identique !`)
        .setFooter({ text: `Demandé par ${message.author.tag}` })
        .setTimestamp();

      const msg = await newChannel.send({ embeds: [embed] });
      setTimeout(() => msg.delete().catch(() => {}), 7000);
    } catch (error) {
      console.error('Erreur clearall :', error);
      message.channel.send('❌ Une erreur est survenue lors du clear du salon.');
    }
  },
};
