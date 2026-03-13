const fs = require('fs');
const { AttachmentBuilder } = require('discord.js');

function readStore() {
  try { return JSON.parse(fs.readFileSync('./data/tickets.json', 'utf8') || '{}'); } catch (_) { return {}; }
}

module.exports = {
  name: 'transcript',
  async execute(message) {
    if (!message.guild) return;
    const store = readStore();
    const cfg = store[message.guild.id] || {};
    const open = cfg.open || {};
    const entry = Object.values(open).find(v => v.channelId === message.channel.id);
    if (!entry) return message.reply('Ce salon n\'est pas un ticket.');

    const isStaff = cfg.staffRole ? message.member.roles.cache.has(cfg.staffRole) : message.member.permissions.has('ManageChannels');
    const isOpener = entry.by === message.author.id;
    if (!isStaff && !isOpener) return message.reply('Action réservée au staff ou à l\'auteur du ticket.');

    try {
      const msgs = await message.channel.messages.fetch({ limit: 100 });
      const lines = [...msgs.values()].sort((a,b) => a.createdTimestamp - b.createdTimestamp).map(m => {
        const author = m.author ? `${m.author.tag}` : 'Unknown';
        return `[${new Date(m.createdTimestamp).toISOString()}] ${author}: ${m.content || ''}`;
      }).join('\n');
      const buffer = Buffer.from(lines, 'utf8');
      const file = new AttachmentBuilder(buffer, { name: `transcript-${message.channel.id}.txt` });
      await message.reply({ content: '🧾 Transcript généré.', files: [file] });
    } catch (e) {
      await message.reply('Impossible de générer le transcript.');
    }
  }
};
