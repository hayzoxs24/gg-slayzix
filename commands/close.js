const fs = require('fs');

function readStore() {
  try { return JSON.parse(fs.readFileSync('./data/tickets.json', 'utf8') || '{}'); } catch (_) { return {}; }
}

module.exports = {
  name: 'close',
  async execute(message) {
    if (!message.guild) return;
    const store = readStore();
    const cfg = store[message.guild.id] || {};
    const open = cfg.open || {};
    const entryKey = Object.keys(open).find(k => open[k].channelId === message.channel.id);
    if (!entryKey) return message.reply('Ce salon n\'est pas un ticket.');

    const isStaff = cfg.staffRole ? message.member.roles.cache.has(cfg.staffRole) : message.member.permissions.has('ManageChannels');
    const isOpener = open[entryKey].by === message.author.id;
    if (!isStaff && !isOpener) return message.reply('Action réservée au staff ou à l\'auteur du ticket.');

    try {
      // Retirer les permissions du créateur du ticket
      await message.channel.permissionOverwrites.edit(entryKey, { ViewChannel: false, SendMessages: false }).catch(() => {});
      // Retirer les permissions pour @everyone
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: false }).catch(() => {});
      
      // Renommer le salon pour indiquer qu'il est fermé
      await message.channel.setName(`fermé・${message.channel.name.replace('ticket・', '').replace('fermé・', '')}`).catch(() => {});
      
      await message.reply('🔒 Ticket fermé. Seul les staffs peuvent voir ce salon. Utilisez "+open" pour réouvrir ou "+sup" pour supprimer.');
    } catch (e) {
      await message.reply('Impossible de fermer ce ticket.');
    }
  }
};
