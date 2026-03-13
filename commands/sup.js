const fs = require('fs');

function readStore() {
  try { return JSON.parse(fs.readFileSync('./data/tickets.json', 'utf8') || '{}'); } catch (_) { return {}; }
}
function writeStore(store) { fs.writeFileSync('./data/tickets.json', JSON.stringify(store, null, 2)); }

module.exports = {
  name: 'sup',
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

    await message.reply('🗑️ Ticket supprimé dans 5s...');
    setTimeout(async () => {
      try {
        delete open[entryKey];
        cfg.open = open;
        store[message.guild.id] = cfg;
        writeStore(store);
        await message.channel.delete().catch(() => {});
      } catch (_) {}
    }, 5000);
  }
};
