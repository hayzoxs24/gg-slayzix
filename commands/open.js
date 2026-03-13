const fs = require('fs');

function readStore() {
  try { return JSON.parse(fs.readFileSync('./data/tickets.json', 'utf8') || '{}'); } catch (_) { return {}; }
}

module.exports = {
  name: 'open',
  async execute(message) {
    if (!message.guild) return;
    const store = readStore();
    const cfg = store[message.guild.id] || {};
    const open = cfg.open || {};
    const entryKey = Object.keys(open).find(k => open[k].channelId === message.channel.id);
    if (!entryKey) return message.reply('Ce salon n\'est pas un ticket.');

    const isStaff = cfg.staffRole ? message.member.roles.cache.has(cfg.staffRole) : message.member.permissions.has('ManageChannels');
    if (!isStaff) return message.reply('Action réservée au staff.');

    try {
      // Redonner les permissions au créateur du ticket
      await message.channel.permissionOverwrites.edit(entryKey, { 
        ViewChannel: true, 
        SendMessages: true, 
        ReadMessageHistory: true, 
        AttachFiles: true 
      }).catch(() => {});
      
      // Renommer le salon pour retirer "fermé"
      const currentName = message.channel.name;
      if (currentName.startsWith('fermé・')) {
        const newName = currentName.replace('fermé・', 'ticket・');
        await message.channel.setName(newName).catch(() => {});
      }
      
      await message.reply(`🔓 Ticket réouvert par ${message.author}. <@${entryKey}> peut à nouveau accéder au salon.`);
    } catch (e) {
      await message.reply('Impossible de réouvrir ce ticket.');
    }
  }
};
