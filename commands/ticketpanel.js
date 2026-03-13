const fs = require('fs');
const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function readStore() {
  try { return JSON.parse(fs.readFileSync('./data/tickets.json', 'utf8') || '{}'); } catch (_) { return {}; }
}

module.exports = {
  name: 'ticketpanel',
  async execute(message) {
    const store = readStore();
    const guildData = store[message.guild.id] || { types: [] };
    const types = guildData.types || [];

    if (types.length === 0) return message.reply('Configurez d\'abord des types: `+tickettype add ...`');

    const embed = new EmbedBuilder()
      .setColor('#6C5CE7')
      .setTitle('🎟️ Centre de Ticket')
      .setDescription('Sélectionnez le type de ticket correspondant à votre demande, puis cliquez sur "Ouvrir".')
      .setThumbnail(message.guild.iconURL({ size: 256 }))
      .setFooter({ text: 'Crow Bot • Tickets' })
      .setTimestamp();

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select')
      .setPlaceholder('Choisir un type de ticket')
      .addOptions(types.slice(0, 25).map(t => ({
        label: t.name.slice(0, 100),
        description: (t.description || 'Support').slice(0, 100),
        value: `type:${t.name}`,
        emoji: t.emoji || undefined
      })));

    const openBtn = new ButtonBuilder()
      .setCustomId('ticket_open')
      .setLabel('Ouvrir')
      .setEmoji('📩')
      .setStyle(ButtonStyle.Success);

    const rows = [
      new ActionRowBuilder().addComponents(menu),
      new ActionRowBuilder().addComponents(openBtn)
    ];

    await message.channel.send({ embeds: [embed], components: rows });
  }
};
