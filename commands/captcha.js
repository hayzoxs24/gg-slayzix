const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: 'captcha',
  execute(message, args, client) {
    const guildId = message.guild.id;
    
    if (!args.length) {
      // Afficher le statut du captcha
      try {
        const captchaData = JSON.parse(fs.readFileSync('./data/captcha.json', 'utf8') || '{}');
        const guildCaptcha = captchaData[guildId];
        
        const embed = new EmbedBuilder()
          .setColor(guildCaptcha?.enabled ? '#00ff00' : '#ff0000')
          .setTitle(`🔐 Captcha ${guildCaptcha?.enabled ? 'Activé' : 'Désactivé'}`)
          .setDescription(guildCaptcha?.enabled ? 
            `**Rôle:** ${guildCaptcha.role ? `<@&${guildCaptcha.role}>` : 'Non configuré'}\n**Salon:** ${guildCaptcha.channel ? `<#${guildCaptcha.channel}>` : 'Non configuré'}` :
            'Le système de captcha est désactivé.')
          .setTimestamp();
        
        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Erreur lors de la lecture du captcha:', error);
      }
      return;
    }

    const action = args[0].toLowerCase();

    try {
      const captchaData = JSON.parse(fs.readFileSync('./data/captcha.json', 'utf8') || '{}');
      
      if (!captchaData[guildId]) {
        captchaData[guildId] = { enabled: false };
      }

      if (action === 'enable') {
        const role = message.mentions.roles.first();
        if (!role) {
          const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Erreur')
            .setDescription('Veuillez mentionner un rôle pour le captcha.\n**Exemple:** `+captcha enable @Membre`');
          return message.reply({ embeds: [embed] });
        }

        captchaData[guildId] = {
          enabled: true,
          role: role.id,
          channel: message.channel.id
        };

        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Captcha activé')
          .setDescription(`**Rôle:** ${role}\n**Salon:** ${message.channel}\n\nLes nouveaux membres devront résoudre un captcha pour obtenir ce rôle.`)
          .setTimestamp();
        
        message.reply({ embeds: [embed] });
      } else if (action === 'disable') {
        captchaData[guildId].enabled = false;
        
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Captcha désactivé')
          .setDescription('Le système de captcha a été désactivé.')
          .setTimestamp();
        
        message.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('❌ Erreur')
          .setDescription('Actions disponibles: `enable`, `disable`\n**Exemple:** `+captcha enable @Membre`');
        return message.reply({ embeds: [embed] });
      }

      fs.writeFileSync('./data/captcha.json', JSON.stringify(captchaData, null, 2));
    } catch (error) {
      console.error('Erreur lors de la configuration du captcha:', error);
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la configuration du captcha.');
      message.reply({ embeds: [embed] });
    }
  }
};
