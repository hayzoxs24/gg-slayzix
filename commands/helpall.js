const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'helpall',
  async execute(message, args, client) {
    // --- DÉFINITION DES CATÉGORIES ---
    const categories = {
      utilitaires: {
        emoji: '🧮',
        name: 'Utilitaires',
        value:
          '`+calc` - Calculatrice\n' +
          '`+embed` - Créer un embed\n' +
          '`+emoji` - Copier un emoji\n' +
          '`+say` - Répéter un message\n' +
          '`+snipe` - Dernier message supprimé\n' +
          '`+clear` - Supprimer des messages\n' +
          '`+clearall` - Purge complète d\'un salon'
      },
      giveaway: {
        emoji: '🎉',
        name: 'Giveaway',
        value:
          '`+gstart` - Créer un giveaway\n' +
          '`+gend` - Terminer un giveaway\n' +
          '`+greroll` - Reroll un giveaway'
      },
      infos: {
        emoji: '👤',
        name: 'Informations',
        value:
          '`+ping` - Latence du bot\n' +
          '`+serverinfo` - Infos serveur\n' +
          '`+userinfo` - Infos utilisateur\n' +
          '`+roleinfo` - Infos rôle\n' +
          '`+rolemembers` - Membres d’un rôle'
      },
      stats: {
        emoji: '📊',
        name: 'Statistiques',
        value:
          '`+allbans` - Liste des bannis\n' +
          '`+allbots` - Liste des bots\n' +
          '`+boosters` - Liste des boosters\n' +
          '`+vc` - Stats du serveur'
      },
      images: {
        emoji: '🖼️',
        name: 'Images',
        value:
          '`+banner` - Bannière utilisateur\n' +
          '`+pic` - Photo de profil\n' +
          '`+serverbanner` - Bannière serveur\n' +
          '`+serverpic` - Icône serveur'
      },
      protection: {
        emoji: '🛡️',
        name: 'Protection',
        value:
          '`+antiban` - Anti-ban\n' +
          '`+antibot` - Anti-bot\n' +
          '`+antilink` - Anti-link\n' +
          '`+antispam` - Anti-spam\n' +
          '`+antieveryone` - Anti-everyone\n' +
          '`+antichannel` - Anti-création/édition de salons\n' +
          '`+antirole` - Anti-création/édition de rôles\n' +
          '`+antiupdate` - Anti-modification serveur\n' +
          '`+antiwebhook` - Anti-webhook\n' +
          '`+antivanity` - Anti-vanity URL'
      },
      tickets: {
        emoji: '🎫',
        name: 'Tickets',
        value:
          '`+ticketpanel` - Envoyer le panel de tickets\n' +
          '`+ticketsetup` - Configurer staff/catégorie des tickets\n' +
          '`+tickettype` - Gérer les types de tickets\n' +
          '`+claim` - Claim un ticket\n' +
          '`+close` - Fermer un ticket\n' +
          '`+open` - Réouvrir un ticket\n' +
          '`+sup` - Supprimer un ticket\n' +
          '`+transcript` - Générer un transcript'
      },
      config: {
        emoji: '🔧',
        name: 'Configuration',
        value:
          '`+ghostping` - Configurer ghostping\n' +
          '`+tempvoc` - Salons vocaux temporaires\n' +
          '`+captcha` - Système captcha\n' +
          '`+setuplog` - Configuration des logs'
      },
      vocal: {
        emoji: '🔊',
        name: 'Vocal',
        value: '`+voicemove` - Déplacer un membre vocal'
      },
      admin: {
        emoji: '⚙️',
        name: 'Administration',
        value:
          '`+activity` - Changer l’activité\n' +
          '`+name` - Changer le nom du bot\n' +
          '`+leave` - Quitter un serveur (owner)\n' +
          '`+servers` - Liste des serveurs\n' +
          '`+invite` - Lien d’invitation'
      },
      moderation: {
        emoji: '🔨',
        name: 'Modération',
        value:
          '`+rename` - Renommer un salon\n' +
          '`+mute` - Timeout un membre\n' +
          '`+lock` - Verrouiller un salon\n' +
          '`+unlock` - Déverrouiller un salon\n' +
          '`+hide` - Masquer un salon\n' +
          '`+unhide` - Rendre un salon visible'
      },
      gerants: {
        emoji: '👑',
        name: 'Gérants',
        value:
          '`+alladmin` - Liste des gérants\n' +
          '`+rankadmin` - Ajouter un gérant\n' +
          '`+derankadmin` - Retirer un gérant'
      },
    };

    // --- EMBED PRINCIPAL ---
    const mainEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📚 Liste des commandes - Crow Bot ')
      .setDescription('Clique sur une catégorie ci-dessous pour voir les commandes correspondantes.')
      .setTimestamp()
      .setFooter({ text: `Préfixe: ${client.config?.prefix || '+'}` });

    // --- NAVIGATION PAR FLÈCHES ---
    const order = ['utilitaires','giveaway','infos','stats','images','protection','tickets','config','vocal','moderation','gerants','admin'];
    let index = 0;

    const makeEmbed = () => {
      const key = order[index];
      const cat = categories[key];
      const currentPage = index + 1;
      const totalPages = order.length;
      return new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`${cat.emoji} ${cat.name}`)
        .setDescription(cat.value)
        .setFooter({ text: `Page ${currentPage} / ${totalPages} • Préfixe: ${client.config?.prefix || '+'}` })
        .setTimestamp();
    };

    const makeRow = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('help_prev').setEmoji('◀️').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('help_label').setLabel(categories[order[index]].name).setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId('help_next').setEmoji('▶️').setStyle(ButtonStyle.Secondary)
    );

    const helpMessage = await message.reply({ embeds: [makeEmbed()], components: [makeRow()] });

    const collector = helpMessage.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id && ['help_prev','help_next'].includes(i.customId),
      time: 120000,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'help_prev') index = (index - 1 + order.length) % order.length;
      if (interaction.customId === 'help_next') index = (index + 1) % order.length;
      await interaction.update({ embeds: [makeEmbed()], components: [makeRow()] });
    });

    collector.on('end', async () => {
      const row = makeRow();
      row.components.forEach(b => b.setDisabled(true));
      await helpMessage.edit({ content: '⏱️ Menu d’aide expiré.', components: [row] });
    });
  },
};
