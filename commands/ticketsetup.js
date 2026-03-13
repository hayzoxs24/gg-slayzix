const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

function readStore() {
  try { return JSON.parse(fs.readFileSync('./data/tickets.json', 'utf8') || '{}'); } catch (_) { return {}; }
}
function writeStore(store) { fs.writeFileSync('./data/tickets.json', JSON.stringify(store, null, 2)); }

module.exports = {
  name: 'ticketsetup',
  async execute(message, args) {
    const sub = (args[0] || '').toLowerCase();
    const store = readStore();
    if (!store[message.guild.id]) store[message.guild.id] = { types: [], staffRole: null, categoryId: null };

    if (!sub || sub === 'help') {
      const e = new EmbedBuilder()
        .setColor('#ffa500')
        .setTitle('⚙️ Setup Tickets')
        .setDescription('Utilisation:\n' +
          '`+ticketsetup staff <@role|roleId|nom>`\n' +
          '`+ticketsetup category <#salon|id|nom>`\n' +
          '`+ticketsetup show`')
        .setTimestamp();
      return message.reply({ embeds: [e] });
    }

    if (sub === 'staff') {
      const roleMention = message.mentions.roles.first();
      const input = args.slice(1).join(' ');
      let role = roleMention || message.guild.roles.cache.get(input) || message.guild.roles.cache.find(r => r.name.toLowerCase() === input.toLowerCase());
      if (!role) return message.reply('Rôle introuvable.');
      store[message.guild.id].staffRole = role.id;
      writeStore(store);
      return message.reply(`✅ Rôle staff défini: ${role}`);
    }

    if (sub === 'category') {
      const chMention = message.mentions.channels.first();
      const input = args.slice(1).join(' ');
      let category = chMention || message.guild.channels.cache.get(input) || message.guild.channels.cache.find(c => c.type === 4 && c.name.toLowerCase() === input.toLowerCase());
      if (!category || category.type !== 4) return message.reply('Catégorie invalide.');
      store[message.guild.id].categoryId = category.id;
      writeStore(store);
      return message.reply(`✅ Catégorie définie: ${category.name}`);
    }

    if (sub === 'show') {
      const cfg = store[message.guild.id];
      const e = new EmbedBuilder()
        .setColor('#00d1b2')
        .setTitle('⚙️ Configuration Tickets')
        .addFields(
          { name: 'Rôle Staff', value: cfg.staffRole ? `<@&${cfg.staffRole}>` : 'Non défini', inline: true },
          { name: 'Catégorie', value: cfg.categoryId ? `<#${cfg.categoryId}>` : 'Non défini', inline: true },
          { name: 'Types', value: (cfg.types || []).map(t => `${t.emoji || '🎟️'} ${t.name}`).join(', ') || 'Aucun' }
        )
        .setTimestamp();
      return message.reply({ embeds: [e] });
    }

    return message.reply('Sous-commande inconnue. Essayez `+ticketsetup help`.');
  }
};
