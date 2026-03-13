const fs = require('fs');

function readStore() {
  try { return JSON.parse(fs.readFileSync('./data/tickets.json', 'utf8') || '{}'); } catch (_) { return {}; }
}

module.exports = {
  name: 'claim',
  async execute(message) {
    if (!message.guild) return;
    const store = readStore();
    const cfg = store[message.guild.id] || {};
    const open = cfg.open || {};
    const entry = Object.values(open).find(v => v.channelId === message.channel.id);
    if (!entry) return message.reply('Ce salon n\'est pas un ticket.');

    const isStaff = cfg.staffRole ? message.member.roles.cache.has(cfg.staffRole) : message.member.permissions.has('ManageChannels');
    if (!isStaff) return message.reply('Réservé au staff.');

    await message.reply(`🛠️ Ticket pris en charge par ${message.author}.`);
  }
};
