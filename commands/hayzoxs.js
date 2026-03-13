module.exports = {
  name: "hayzoxs",
  description: "Envoie un DM à tous les membres du serveur (hors bots).",

  async execute(message, args) {
    if (!args || args.length === 0) {
      return message.reply("❌ Tu dois fournir un message à envoyer.\nUsage : `+hayzoxs <message>`");
    }

    const texte = args.join(" ");

    // Récupère tous les membres du serveur
    let members;
    try {
      members = await message.guild.members.fetch();
    } catch (err) {
      return message.reply("❌ Impossible de récupérer les membres du serveur.");
    }

    const totalHumans = members.filter(m => !m.user.bot).size;
    const statusMsg = await message.reply(`📨 Envoi en cours à **${totalHumans}** membres...`);

    let success = 0;
    let failed = 0;

    for (const [, member] of members) {
      if (member.user.bot) continue;
      try {
        await member.send(texte);
        success++;
      } catch {
        failed++;
      }
    }

    await statusMsg.edit(
      `✅ DM terminé !\n` +
      `📨 Envoyés : **${success}**\n` +
      `❌ Échoués (DM fermés) : **${failed}**`
    );
  },
};
