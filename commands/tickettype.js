const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

function readStore() {
  try {
    return JSON.parse(fs.readFileSync('./data/tickets.json', 'utf8') || '{}');
  } catch (_) {
    return {};
  }
}

function writeStore(store) {
  fs.writeFileSync('./data/tickets.json', JSON.stringify(store, null, 2));
}

module.exports = {
  name: 'tickettype',
  async execute(message, args) {
    const sub = (args[0] || '').toLowerCase();

    const store = readStore();
    if (!store[message.guild.id]) store[message.guild.id] = { types: [], staffRole: null, categoryId: null };

    if (!sub || ['help'].includes(sub)) {
      const embed = new EmbedBuilder()
        .setColor('#00ccff')
        .setTitle('🎫 Gestion des types de tickets')
        .setDescription('Utilisation:\n' +
          '`+tickettype add <nom> | <emoji> | <description>`\n' +
          '`+tickettype remove <nom>`\n' +
          '`+tickettype list`')
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (sub === 'list') {
      const types = store[message.guild.id].types || [];
      if (types.length === 0) return message.reply('Aucun type de ticket configuré.');
      const embed = new EmbedBuilder()
        .setColor('#00cc88')
        .setTitle('🎫 Types de tickets')
        .setDescription(types.map(t => `${t.emoji || '🎟️'} **${t.name}** — ${t.description || 'Aucune description'}`).join('\n'))
        .setTimestamp();
      return message.reply({ embeds: [embed] });
    }

    if (sub === 'add') {
      const joined = args.slice(1).join(' ');
      if (!joined.includes('|')) return message.reply('Format: `+tickettype add <nom> | <emoji> | <description>`');
      const parts = joined.split('|').map(s => s.trim());
      const name = parts[0];
      const emoji = parts[1] || '🎟️';
      const description = parts.slice(2).join(' | ') || 'Support';
      if (!name) return message.reply('Nom invalide.');

      const types = store[message.guild.id].types || [];
      if (types.find(t => t.name.toLowerCase() === name.toLowerCase())) {
        return message.reply('Ce type existe déjà.');
      }
      types.push({ name, emoji, description });
      store[message.guild.id].types = types;
      writeStore(store);
      return message.reply(`✅ Type de ticket ajouté: ${emoji} ${name}`);
    }

    if (sub === 'remove') {
      const name = args.slice(1).join(' ').trim();
      if (!name) return message.reply('Précisez le nom: `+tickettype remove <nom>`');
      const types = store[message.guild.id].types || [];
      const before = types.length;
      store[message.guild.id].types = types.filter(t => t.name.toLowerCase() !== name.toLowerCase());
      if (store[message.guild.id].types.length === before) return message.reply('Type introuvable.');
      writeStore(store);
      return message.reply(`🗑️ Type supprimé: ${name}`);
    }

    return message.reply('Sous-commande inconnue. Essayez `+tickettype help`.');
  }
};
