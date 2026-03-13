const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const { Client, GatewayIntentBits, ActivityType, Collection, EmbedBuilder, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");

function animateText(text, color = 'cyan', delay = 50) {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      process.stdout.write(chalk[color](text[i]));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        console.log();
        resolve();
      }
    }, delay);
  });
}

function createProgressBar(current, total, width = 30) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percentage}%`;
}

function displayStyledTitle() {
  process.stdout.write('\x1B[2J\x1B[0f');
  
  console.log(chalk.hex('#FFD700')(
    figlet.textSync("Crow Bot V5", { 
      horizontalLayout: "full",
      font: "ANSI Shadow"
    })
  ));
  
  console.log(chalk.hex('#FF6B6B')('═'.repeat(80)));
  
  console.log(chalk.hex('#FF6B6B')('═'.repeat(80)));
  console.log();
}

function displayConfigStep(step, total, description) {
  console.log(chalk.cyan(`\n[${step}/${total}] ${description}`));
}

function displaySuccess(message) {
  console.log(chalk.hex('#00B894')(`✅ ${message}`));
}

function displayError(message) {
  console.log(chalk.hex('#E17055')(`❌ ${message}`));
}

function displayInfo(message) {
  console.log(chalk.hex('#0984E3')(`ℹ️  ${message}`));
}

function displayWarning(message) {
  console.log(chalk.hex('#FDCB6E')(`⚠️  ${message}`));
}

displayStyledTitle();

function restoreGiveaways(client) {
  try {
    const giveaways = JSON.parse(fs.readFileSync('./data/giveaways.json', 'utf8') || '{}');
    let restored = 0;
    
    for (const [giveawayId, giveaway] of Object.entries(giveaways)) {
      if (!giveaway.ended && giveaway.endTime > Date.now()) {
        const remainingTime = giveaway.endTime - Date.now();
        setTimeout(() => {
          const command = require('./commands/gend');
          command.endGiveaway(giveawayId, client);
        }, remainingTime);
        restored++;
      }
    }
    
    if (restored > 0) {
      console.log(chalk.green(`🎉 ${restored} giveaway(s) restauré(s)`));
    }
  } catch (error) {
    console.error('Erreur lors de la restauration des giveaways:', error);
  }
}

function saveDeletedMessage(message) {
  try {
    const snipes = JSON.parse(fs.readFileSync('./data/snipes.json', 'utf8') || '{}');
    
    if (!snipes[message.channel.id]) {
      snipes[message.channel.id] = [];
    }
    
    const snipeData = {
      content: message.content,
      authorId: message.author.id,
      deletedAt: Date.now(),
      attachments: message.attachments.map(att => ({
        name: att.name,
        url: att.url
      }))
    };
    
    snipes[message.channel.id].push(snipeData);
    
    if (snipes[message.channel.id].length > 10) {
      snipes[message.channel.id] = snipes[message.channel.id].slice(-10);
    }
    
    fs.writeFileSync('./data/snipes.json', JSON.stringify(snipes, null, 2));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du message supprimé:', error);
  }
}

async function checkSupportStatus(member, config) {
  try {
    if (!config.supportEnabled) return;
    const keyword = (config.supportStatus || '').toLowerCase().trim();
    if (!keyword || !config.supportRole) return;

    let presence = member.presence;
    if (!presence) {
      try {
        const freshMember = await member.guild.members.fetch(member.id);
        presence = freshMember.presence;
      } catch (_) {}
    }
    if (!presence) return;

    const activities = presence.activities || [];
    const hasSupportStatus = activities.some(activity => {
      const name = (activity.name || '').toLowerCase();
      const state = (activity.state || '').toLowerCase(); // custom status text
      const details = (activity.details || '').toLowerCase();
      return (
        (name && name.includes(keyword)) ||
        (state && state.includes(keyword)) ||
        (details && details.includes(keyword))
      );
    });

    const supportRole = member.guild.roles.cache.get(config.supportRole) || 
                        member.guild.roles.cache.find(r => r.name === config.supportRole);

    if (!supportRole) return;

    if (hasSupportStatus) {
      if (!member.roles.cache.has(supportRole.id)) {
        await member.roles.add(supportRole).catch(() => {});
        console.log(`🎖️ Rôle de soutien "${supportRole.name}" attribué à ${member.user.tag}`);
      }
    } else {
      if (member.roles.cache.has(supportRole.id)) {
        await member.roles.remove(supportRole).catch(() => {});
        console.log(`🎖️ Rôle de soutien "${supportRole.name}" retiré de ${member.user.tag}`);
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de soutien:', error);
  }
}

function checkAntiSystems(message) {
  try {
    const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
    const guildAnti = antiData[message.guild.id];
    
    if (!guildAnti) return false;
    
    if (guildAnti.antilink && /https?:\/\/[^\s]+/.test(message.content)) {
      message.delete().catch(() => {});
      message.channel.send(`⚠️ ${message.author}, les liens ne sont pas autorisés ici!`).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
      return true;
    }
    
    if (guildAnti.antieveryone && message.content.includes('@everyone')) {
      message.delete().catch(() => {});
      message.channel.send(`⚠️ ${message.author}, les mentions @everyone ne sont pas autorisées!`).then(msg => {
        setTimeout(() => msg.delete().catch(() => {}), 5000);
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification des systèmes anti:', error);
    return false;
  }
}

async function getMissingConfigValues(config) {
  const missingValues = [];
  
  if (!config.token || config.token.trim() === '') {
    displayConfigStep(1, 8, "Configuration du Token");
    missingValues.push({
      name: "token",
      message: "Entre le token du bot :",
      type: "password",
      mask: "*",
      validate: (v) => (v ? true : "Le token est obligatoire."),
    });
  }
  
  if (!config.prefix || config.prefix.trim() === '') {
    displayConfigStep(2, 8, "Configuration du Préfixe");
    missingValues.push({
      name: "prefix",
      message: "Quel préfixe veux-tu pour les commandes du bot ?",
      type: "input",
      default: "+",
      validate: (v) => (v.trim().length > 0 ? true : "Le préfixe ne peut pas être vide."),
    });
  }
  
  if (config.statusEnabled === undefined) {
    displayConfigStep(3, 8, "Système de Statut");
    missingValues.push({
      name: "statusEnabled",
      message: "Voulez-vous activer le système de statut personnalisé ?",
      type: "confirm",
      default: true,
    });
  }
  
  if (config.statusEnabled && (!config.status || !config.status.text || config.status.text.trim() === '')) {
    displayConfigStep(4, 8, "Configuration du Statut");
    missingValues.push({
      name: "statusText",
      message: "Texte du statut du bot :",
      type: "input",
      default: "En ligne 🚀",
    });
    
    missingValues.push({
      name: "statusType",
      message: "Type d'activité :",
      type: "list",
      choices: [
        { name: "Playing", value: ActivityType.Playing },
        { name: "Listening", value: ActivityType.Listening },
        { name: "Watching", value: ActivityType.Watching },
        { name: "Streaming", value: ActivityType.Streaming },
        { name: "Competing", value: ActivityType.Competing },
        { name: "Custom", value: ActivityType.Custom },
      ],
    });
  }
  
  if (!config.managers || config.managers.length === 0) {
    displayConfigStep(5, 8, "Configuration des Gérants");
    missingValues.push({
      name: "managers",
      message: "Entre les IDs des gérants du bot (séparés par des virgules, optionnel) :",
      type: "input",
    });
  }
  
  if (config.autoRoleEnabled === undefined) {
    displayConfigStep(6, 8, "Système d'Auto-Rôle");
    missingValues.push({
      name: "autoRoleEnabled",
      message: "Voulez-vous activer le système d'auto-rôle ?",
      type: "confirm",
      default: false,
    });
  }
  
  if (config.autoRoleEnabled && (!config.autoRole || config.autoRole.trim() === '')) {
    missingValues.push({
      name: "autoRole",
      message: "ID ou nom du rôle à attribuer automatiquement :",
      type: "input",
    });
  }
  
  if (config.welcomeEnabled === undefined) {
    displayConfigStep(7, 8, "Système de Bienvenue");
    missingValues.push({
      name: "welcomeEnabled",
      message: "Voulez-vous activer le système de bienvenue ?",
      type: "confirm",
      default: false,
    });
  }
  
  if (config.welcomeEnabled && (!config.welcomeChannel || config.welcomeChannel.trim() === '')) {
    missingValues.push({
      name: "welcomeChannel",
      message: "ID du salon où envoyer un message de bienvenue :",
      type: "input",
    });
  }
  
  if (config.supportEnabled === undefined) {
    displayConfigStep(8, 8, "Système de Détection de Statut");
    missingValues.push({
      name: "supportEnabled",
      message: "Voulez-vous activer le système de détection de statut de soutien ?",
      type: "confirm",
      default: false,
    });
  }
  
  if (config.supportEnabled && (!config.supportStatus || config.supportStatus.trim() === '')) {
    missingValues.push({
      name: "supportStatus",
      message: "Texte du statut de soutien à détecter :",
      type: "input",
    });
  }
  
  if (config.supportEnabled && (!config.supportRole || config.supportRole.trim() === '')) {
    missingValues.push({
      name: "supportRole",
      message: "ID ou nom du rôle à attribuer aux utilisateurs avec le statut de soutien :",
      type: "input",
    });
  }
  
  return missingValues;
}

async function main() {
  let config;

  // ── MODE RAILWAY / SERVEUR : lecture depuis les variables d'environnement ──
  if (process.env.DISCORD_TOKEN) {
    displayInfo("Chargement de la configuration depuis les variables d'environnement...");

    const statusText = process.env.STATUS_TEXT || null;
    const statusTypeRaw = process.env.STATUS_TYPE || "Playing";
    const statusTypeMap = {
      Playing: ActivityType.Playing,
      Listening: ActivityType.Listening,
      Watching: ActivityType.Watching,
      Streaming: ActivityType.Streaming,
      Competing: ActivityType.Competing,
      Custom: ActivityType.Custom,
    };

    config = {
      token: process.env.DISCORD_TOKEN.trim(),
      prefix: process.env.PREFIX || "+",
      statusEnabled: !!statusText,
      status: {
        text: statusText,
        type: statusTypeMap[statusTypeRaw] ?? ActivityType.Playing,
      },
      managers: process.env.MANAGERS
        ? process.env.MANAGERS.split(",").map(id => id.trim()).filter(Boolean)
        : [],
      autoRoleEnabled: process.env.AUTO_ROLE ? true : false,
      autoRole: process.env.AUTO_ROLE || null,
      welcomeEnabled: process.env.WELCOME_CHANNEL ? true : false,
      welcomeChannel: process.env.WELCOME_CHANNEL || null,
      supportEnabled: process.env.SUPPORT_STATUS ? true : false,
      supportStatus: process.env.SUPPORT_STATUS || null,
      supportRole: process.env.SUPPORT_ROLE || null,
    };

    displaySuccess("Configuration chargée depuis les variables d'environnement !");

  // ── MODE LOCAL : configuration interactive (config.json ou prompts) ──
  } else if (fs.existsSync("./config.json")) {
    config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
    displaySuccess("Configuration chargée depuis config.json");
    
    const missingValues = await getMissingConfigValues(config);
    
    if (missingValues.length > 0) {
      displayWarning(`Configuration incomplète détectée. ${missingValues.length} valeur(s) manquante(s)`);
      
      const answers = await inquirer.prompt(missingValues);
      
      if (answers.token) config.token = answers.token.trim();
      if (answers.prefix) config.prefix = answers.prefix.trim();
      
      if (answers.statusEnabled !== undefined) {
        config.statusEnabled = answers.statusEnabled;
        if (!answers.statusEnabled) config.status = { text: null, type: null };
      }
      if (answers.statusText) {
        if (!config.status) config.status = {};
        config.status.text = answers.statusText;
      }
      if (answers.statusType !== undefined) {
        if (!config.status) config.status = {};
        config.status.type = answers.statusType;
      }
      if (answers.managers) {
        config.managers = answers.managers
          .split(",").map(id => id.trim()).filter(id => id.length > 0);
      }
      if (answers.autoRoleEnabled !== undefined) {
        config.autoRoleEnabled = answers.autoRoleEnabled;
        if (!answers.autoRoleEnabled) config.autoRole = null;
      }
      if (answers.autoRole) config.autoRole = answers.autoRole.trim() || null;
      if (answers.welcomeEnabled !== undefined) {
        config.welcomeEnabled = answers.welcomeEnabled;
        if (!answers.welcomeEnabled) config.welcomeChannel = null;
      }
      if (answers.welcomeChannel) config.welcomeChannel = answers.welcomeChannel.trim() || null;
      if (answers.supportEnabled !== undefined) {
        config.supportEnabled = answers.supportEnabled;
        if (!answers.supportEnabled) { config.supportStatus = null; config.supportRole = null; }
      }
      if (answers.supportStatus) config.supportStatus = answers.supportStatus.trim() || null;
      if (answers.supportRole) config.supportRole = answers.supportRole.trim() || null;
      
      fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
      displaySuccess("Configuration mise à jour dans config.json");
    }
  } else {
    displayInfo("Première configuration du bot");
    
    const missingValues = await getMissingConfigValues({});
    const answers = await inquirer.prompt(missingValues);

    config = {
      token: answers.token.trim(),
      prefix: answers.prefix.trim(),
      statusEnabled: answers.statusEnabled,
      status: answers.statusEnabled ? {
        text: answers.statusText,
        type: answers.statusType,
      } : { text: null, type: null },
      managers: answers.managers
        ? answers.managers.split(",").map(id => id.trim()).filter(id => id.length > 0)
        : [],
      autoRoleEnabled: answers.autoRoleEnabled,
      autoRole: answers.autoRoleEnabled ? (answers.autoRole?.trim() || null) : null,
      welcomeEnabled: answers.welcomeEnabled,
      welcomeChannel: answers.welcomeEnabled ? (answers.welcomeChannel?.trim() || null) : null,
      supportEnabled: answers.supportEnabled,
      supportStatus: answers.supportEnabled ? (answers.supportStatus?.trim() || null) : null,
      supportRole: answers.supportEnabled ? (answers.supportRole?.trim() || null) : null,
    };

    fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
    displaySuccess("Configuration enregistrée dans config.json");
    displayInfo("Configuration terminée. Relancement automatique du bot...");
    setTimeout(() => process.exit(0), 2000);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildPresences
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.GuildMember,
      Partials.User
    ]
  });

  client.commands = new Collection();

  const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.name && typeof command.execute === "function") {
      client.commands.set(command.name, command);
    } else {
      console.log(chalk.red(`❌ Commande invalide : ${file}`));
    }
  }

  client.once("clientReady", () => {
    if (config.statusEnabled && config.status.text) {
      client.user.setActivity(config.status.text, { type: config.status.type });
    }
    
    console.log(chalk.hex('#74B9FF')(`🤖 Connecté en tant que : ${client.user.tag}`));
    console.log(chalk.hex('#A29BFE')(`💬 Préfixe : ${config.prefix}`));
    console.log(chalk.hex('#FD79A8')(`👑 Gérants : ${config.managers.join(", ") || "Aucun"}`));
    
    if (config.statusEnabled && config.status.text) {
      console.log(chalk.hex('#6C5CE7')(`🎯 Statut personnalisé : ${config.status.text}`));
    } else {
      console.log(chalk.gray('🎯 Statut personnalisé : Désactivé'));
    }
    
    if (config.autoRoleEnabled && config.autoRole) {
      console.log(chalk.hex('#FDCB6E')(`🎭 Auto-role : ${config.autoRole}`));
    } else {
      console.log(chalk.gray('🎭 Auto-role : Désactivé'));
    }
    
    if (config.welcomeEnabled && config.welcomeChannel) {
      console.log(chalk.hex('#A29BFE')(`💌 Salon de bienvenue : ${config.welcomeChannel}`));
    } else {
      console.log(chalk.gray('💌 Système de bienvenue : Désactivé'));
    }
    
    if (config.supportEnabled && config.supportStatus) {
      console.log(chalk.hex('#FD79A8')(`🎖️ Détection de statut : ${config.supportStatus}`));
      console.log(chalk.hex('#FD79A8')(`🎖️ Rôle de soutien : ${config.supportRole}`));
    } else {
      console.log(chalk.gray('🎖️ Système de détection de statut : Désactivé'));
    }    
    restoreGiveaways(client);
    // Initial sweep for support status
    setTimeout(async () => {
      try {
        if (!config.supportEnabled || !config.supportStatus || !config.supportRole) return;
        for (const guild of client.guilds.cache.values()) {
          const members = await guild.members.fetch();
          for (const member of members.values()) {
            if (!member.user.bot) checkSupportStatus(member, config);
          }
        }
      } catch (_) {}
    }, 5000);
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    
    if (checkAntiSystems(message)) return;

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    if (config.managers.length > 0 && !config.managers.includes(message.author.id)) {
      return message.reply("❌ Tu n'as pas la permission d'utiliser cette commande.");
    }

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply("⚠️ Erreur lors de l'exécution de la commande.");
    }
  });

  // ---------- LOG HELPERS ----------
  function getLogChannel(guild, logType) {
    try {
      const logsData = JSON.parse(fs.readFileSync('./data/logs.json', 'utf8') || '{}');
      const guildLogs = logsData[guild.id];
      if (!guildLogs) return null;
      // try exact key
      let channelId = guildLogs[logType];
      // accept common alternates
      if (!channelId) {
        const alternates = {
          voice: ['vocal', 'voix', 'voice_logs', 'voiceLog', 'voc'],
          messages: ['message', 'msg']
        };
        const alts = alternates[logType] || [];
        for (const k of alts) {
          if (guildLogs[k]) { channelId = guildLogs[k]; break; }
        }
      }
      // fallback to messages channel if specific not set
      if (!channelId && logType !== 'messages') channelId = guildLogs['messages'];
      if (!channelId) return null;
      return guild.channels.cache.get(channelId) || null;
    } catch (_) {
      return null;
    }
  }

  async function sendLog(guild, logType, embed) {
    const channel = getLogChannel(guild, logType);
    if (!channel) return;
    try {
      await channel.send({ embeds: [embed] });
    } catch (_) {
      // ignore send errors
    }
  }

  client.on("messageDelete", async (message) => {
    try {
      if (message.partial) {
        try { message = await message.fetch(); } catch (_) {}
      }
    } catch (_) {}
    if (
      message.author &&
      !message.author.bot &&
      (message.content || (message.attachments && message.attachments.size > 0))
    ) {
      saveDeletedMessage(message);
    }
    try {
      if (!message.guild) return;
      const embed = new EmbedBuilder()
        .setColor('#ff6b6b')
        .setTitle('🗑️ Message supprimé')
        .addFields(
          { name: 'Auteur', value: `${message.author?.tag || 'Inconnu'} (${message.author?.id || 'N/A'})`, inline: true },
          { name: 'Salon', value: message.channel ? `${message.channel}` : 'Inconnu', inline: true },
        )
        .setDescription(message.content ? `Contenu:\n${String(message.content).slice(0, 1024)}` : 'Aucun contenu')
        .setTimestamp();
      await sendLog(message.guild, 'messages', embed);
    } catch (_) {}
  });

  client.on("messageUpdate", async (oldMessage, newMessage) => {
    try {
      if (oldMessage.partial) { try { oldMessage = await oldMessage.fetch(); } catch (_) {} }
      if (newMessage.partial) { try { newMessage = await newMessage.fetch(); } catch (_) {} }
      if (!newMessage.guild) return;
      if (newMessage.author?.bot) return;
      if (oldMessage.content === newMessage.content) return;
      const embed = new EmbedBuilder()
        .setColor('#f1c40f')
        .setTitle('✏️ Message modifié')
        .addFields(
          { name: 'Auteur', value: `${newMessage.author?.tag || 'Inconnu'} (${newMessage.author?.id || 'N/A'})`, inline: true },
          { name: 'Salon', value: newMessage.channel ? `${newMessage.channel}` : 'Inconnu', inline: true },
        )
        .addFields(
          { name: 'Avant', value: oldMessage.content ? String(oldMessage.content).slice(0, 1024) : 'Inconnu' },
          { name: 'Après', value: newMessage.content ? String(newMessage.content).slice(0, 1024) : 'Inconnu' },
        )
        .setTimestamp();
      await sendLog(newMessage.guild, 'messages', embed);
    } catch (_) {}
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
  
    try {
      // ---------- TICKETS: select + open + controls ----------
      const isTicketSelect = interaction.isStringSelectMenu() && interaction.customId === 'ticket_select';
      const isTicketOpen = interaction.isButton() && interaction.customId === 'ticket_open';
      const isTicketControl = interaction.isButton() && ['ticket_claim','ticket_close','ticket_reopen','ticket_delete','ticket_transcript'].includes(interaction.customId);

      // keep selection state on message id
      const statePath = './data/tickets.json';
      let tStore = {};
      try { tStore = JSON.parse(fs.readFileSync(statePath, 'utf8') || '{}'); } catch (_) {}
      if (!tStore[interaction.guild.id]) tStore[interaction.guild.id] = { types: [], staffRole: null, categoryId: null, open: {} };

      if (isTicketSelect) {
        const value = interaction.values?.[0];
        if (!value || !value.startsWith('type:')) return interaction.reply({ content: 'Sélection invalide.', ephemeral: true });
        const selectedType = value.slice(5);
        // save temporary selection per message
        if (!tStore._panelSelections) tStore._panelSelections = {};
        tStore._panelSelections[interaction.message.id] = { type: selectedType, userId: interaction.user.id, guildId: interaction.guild.id };
        fs.writeFileSync(statePath, JSON.stringify(tStore, null, 2));
        return interaction.reply({ content: `✅ Type sélectionné: ${selectedType}`, ephemeral: true });
      }

      if (isTicketOpen) {
        // restore selection
        const sel = tStore._panelSelections?.[interaction.message.id];
        if (!sel || sel.userId !== interaction.user.id) {
          return interaction.reply({ content: 'Sélectionnez d\'abord un type dans le menu.', ephemeral: true });
        }
        const cfg = tStore[interaction.guild.id];
        const typeObj = (cfg.types || []).find(t => t.name.toLowerCase() === sel.type.toLowerCase());
        if (!typeObj) return interaction.reply({ content: 'Type introuvable.', ephemeral: true });
        if (!cfg.categoryId) return interaction.reply({ content: 'La catégorie des tickets n\'est pas configurée (`+ticketsetup category`).', ephemeral: true });
        const category = interaction.guild.channels.cache.get(cfg.categoryId);
        if (!category) return interaction.reply({ content: 'Catégorie invalide. Reconfigurez-la.', ephemeral: true });

        // prevent duplicate open ticket for user
        const key = `${interaction.user.id}`;
        const openByUser = cfg.open || {};
        if (openByUser[key]) {
          const ch = interaction.guild.channels.cache.get(openByUser[key].channelId);
          if (ch) return interaction.reply({ content: `Vous avez déjà un ticket ouvert: ${ch}`, ephemeral: true });
        }

        const nameSafe = `${typeObj.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 20) || 'ticket';
        const channel = await interaction.guild.channels.create({
          name: `ticket・${interaction.user.username}`.slice(0, 90),
          type: 0,
          parent: category,
          permissionOverwrites: [
            { id: interaction.guild.roles.everyone, deny: ['ViewChannel'] },
            { id: interaction.user.id, allow: ['ViewChannel','SendMessages','ReadMessageHistory','AttachFiles'] },
            ...(cfg.staffRole ? [{ id: cfg.staffRole, allow: ['ViewChannel','SendMessages','ReadMessageHistory','ManageChannels'] }] : [])
          ]
        });

        if (!cfg.open) cfg.open = {};
        cfg.open[key] = { channelId: channel.id, type: typeObj.name, createdAt: Date.now(), by: interaction.user.id };
        tStore[interaction.guild.id] = cfg;
        fs.writeFileSync(statePath, JSON.stringify(tStore, null, 2));

        const controls = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setEmoji('🛠️').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setEmoji('🧾').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ticket_delete').setLabel('Delete').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
        );

        const e = new EmbedBuilder()
          .setColor('#55efc4')
          .setTitle(`${typeObj.emoji || '🎟️'} Ticket: ${typeObj.name}`)
          .setDescription(`${interaction.user} a ouvert un ticket. Expliquez votre demande ci-dessous.`)
          .addFields({ name: 'Type', value: typeObj.name, inline: true })
          .setTimestamp();

        await channel.send({ content: cfg.staffRole ? `<@&${cfg.staffRole}>` : undefined, embeds: [e], components: [controls] });
        return interaction.reply({ content: `✅ Ticket créé: ${channel}`, ephemeral: true });
      }

      if (isTicketControl) {
        const statePath = './data/tickets.json';
        let store = {};
        try { store = JSON.parse(fs.readFileSync(statePath, 'utf8') || '{}'); } catch (_) {}
        const cfg = store[interaction.guild.id] || {};
        const isStaff = cfg.staffRole ? interaction.member.roles.cache.has(cfg.staffRole) : interaction.member.permissions.has('ManageChannels');
        if (!isStaff) return interaction.reply({ content: 'Réservé au staff.', ephemeral: true });

        if (interaction.customId === 'ticket_claim') {
          await interaction.reply({ content: `🛠️ Ticket pris en charge par ${interaction.user}.`, ephemeral: false });
          return;
        }
        if (interaction.customId === 'ticket_close') {
          // Fermer définitivement le ticket pour tous les membres sauf le staff
          const byUser = Object.keys(cfg.open || {}).find(uid => (cfg.open[uid].channelId === interaction.channel.id));
          if (byUser) {
            // Retirer les permissions du créateur du ticket
            await interaction.channel.permissionOverwrites.edit(byUser, { ViewChannel: false, SendMessages: false }).catch(() => {});
          }
          // Retirer les permissions pour @everyone
          await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false }).catch(() => {});
          
          // Renommer le salon pour indiquer qu'il est fermé
          await interaction.channel.setName(`fermé・${interaction.channel.name.replace('ticket・', '').replace('fermé・', '')}`).catch(() => {});
          
          // Modifier les boutons pour remplacer Close par Open
          const controlsClosed = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setEmoji('🛠️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ticket_reopen').setLabel('Open').setEmoji('🔓').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setEmoji('🧾').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_delete').setLabel('Delete').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
          );
          
          await interaction.message.edit({ components: [controlsClosed] }).catch(() => {});
          await interaction.reply({ content: '🔒 Ticket fermé. Seul les staffs peuvent voir ce salon. Utilisez "Open" pour réouvrir ou "Delete" pour supprimer.', ephemeral: false });
          return;
        }
        if (interaction.customId === 'ticket_reopen') {
          // Réouvrir le ticket
          const byUser = Object.keys(cfg.open || {}).find(uid => (cfg.open[uid].channelId === interaction.channel.id));
          if (byUser) {
            // Redonner les permissions au créateur du ticket
            await interaction.channel.permissionOverwrites.edit(byUser, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true }).catch(() => {});
          }
          
          // Renommer le salon pour retirer "fermé"
          const currentName = interaction.channel.name;
          const newName = currentName.replace('fermé・', 'ticket・');
          await interaction.channel.setName(newName).catch(() => {});
          
          // Remettre les boutons originaux avec Close
          const controlsOpen = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setEmoji('🛠️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_transcript').setLabel('Transcript').setEmoji('🧾').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('ticket_delete').setLabel('Delete').setEmoji('🗑️').setStyle(ButtonStyle.Danger)
          );
          
          await interaction.message.edit({ components: [controlsOpen] }).catch(() => {});
          await interaction.reply({ content: `🔓 Ticket réouvert par ${interaction.user}. ${byUser ? `<@${byUser}>` : 'L\'utilisateur'} peut à nouveau accéder au salon.`, ephemeral: false });
          return;
        }
        if (interaction.customId === 'ticket_delete') {
          await interaction.reply({ content: '🗑️ Ticket supprimé dans 5s...', ephemeral: false });
          setTimeout(async () => {
            try {
              // cleanup open index
              const byUser = Object.keys(cfg.open || {}).find(uid => (cfg.open[uid].channelId === interaction.channel.id));
              if (byUser) {
                delete cfg.open[byUser];
                store[interaction.guild.id] = cfg;
                fs.writeFileSync(statePath, JSON.stringify(store, null, 2));
              }
              await interaction.channel.delete().catch(() => {});
            } catch (_) {}
          }, 5000);
          return;
        }
        if (interaction.customId === 'ticket_transcript') {
          try {
            const msgs = await interaction.channel.messages.fetch({ limit: 100 });
            const lines = [...msgs.values()].sort((a,b) => a.createdTimestamp - b.createdTimestamp).map(m => {
              const author = m.author ? `${m.author.tag}` : 'Unknown';
              return `[${new Date(m.createdTimestamp).toISOString()}] ${author}: ${m.content || ''}`;
            }).join('\n');
            const buffer = Buffer.from(lines, 'utf8');
            const file = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.id}.txt` });
            await interaction.reply({ content: '🧾 Transcript généré.', files: [file], ephemeral: false });
          } catch (_) {
            await interaction.reply({ content: 'Impossible de générer le transcript.', ephemeral: true });
          }
          return;
        }
      }
      // ---------- GIVEAWAY ----------
      if (interaction.customId.startsWith('giveaway_')) {
        const giveawayId = interaction.customId.split('_')[1];
        const giveaways = JSON.parse(fs.readFileSync('./data/giveaways.json', 'utf8') || '{}');
        const giveaway = giveaways[giveawayId];
  
        if (!giveaway || giveaway.ended) {
          return interaction.reply({ content: 'Ce giveaway est terminé!', ephemeral: true });
        }
  
        if (giveaway.endTime < Date.now()) {
          return interaction.reply({ content: 'Ce giveaway est expiré!', ephemeral: true });
        }
  
        if (giveaway.participants.includes(interaction.user.id)) {
          giveaway.participants = giveaway.participants.filter(id => id !== interaction.user.id);
          interaction.reply({ content: '❌ Vous avez quitté le giveaway!', ephemeral: true });
        } else {
          giveaway.participants.push(interaction.user.id);
          interaction.reply({ content: '✅ Vous participez maintenant au giveaway!', ephemeral: true });
        }
  
        fs.writeFileSync('./data/giveaways.json', JSON.stringify(giveaways, null, 2));
        
        // Mettre à jour le message du giveaway avec le nombre de participants
        try {
          const channel = await client.channels.fetch(giveaway.channelId);
          const message = await channel.messages.fetch(giveaway.messageId);
          
          const updatedEmbed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🎉 NOUVEAU GIVEAWAY!')
            .setDescription(`**Prix:** ${giveaway.prize}\n**Gagnants:** ${giveaway.winners}\n**Participants:** ${giveaway.participants.length}\n**Fin:** <t:${Math.floor(giveaway.endTime / 1000)}:R>\n\nCliquez sur le bouton pour participer!`)
            .setTimestamp()
            .setFooter({ text: `ID: ${giveawayId}` });
          
          await message.edit({ embeds: [updatedEmbed] });
        } catch (err) {
          console.error('Erreur lors de la mise à jour du giveaway:', err);
        }
      }
  
      // ---------- LOGS ----------
      if (interaction.customId.startsWith('log_')) {
        const logType = interaction.customId.split('_')[1];
  
        if (logType === 'reset') {
          const logsData = JSON.parse(fs.readFileSync('./data/logs.json', 'utf8') || '{}');
          delete logsData[interaction.guild.id];
          fs.writeFileSync('./data/logs.json', JSON.stringify(logsData, null, 2));
  
          const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Configuration des logs réinitialisée')
            .setDescription('Tous les salons de logs ont été supprimés.')
            .setTimestamp();
  
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }
  
        if (logType === 'autosetup') {
          try {
            const guild = interaction.guild;
            const category = await guild.channels.create({ name: '📘 logs', type: 4 });
            const types = [
              { key: 'messages', name: '⚙️・logs-messages' },
              { key: 'members', name: '⚙️・logs-membres' },
              { key: 'roles', name: '⚙️・logs-roles' },
              { key: 'voice', name: '⚙️・logs-voc' },
              { key: 'boost', name: '⚙️・logs-boost' },
              { key: 'moderation', name: '⚙️・logs-mod' },
              { key: 'raid', name: '⚙️・logs-raid' },
              { key: 'announcements', name: '⚙️・logs-annonces' },
              { key: 'system', name: '⚙️・logs-system' }
            ];
            const created = {};
            for (const t of types) {
              const ch = await guild.channels.create({ name: t.name, type: 0, parent: category });
              created[t.key] = ch.id;
            }
            const logsData = JSON.parse(fs.readFileSync('./data/logs.json', 'utf8') || '{}');
            if (!logsData[guild.id]) logsData[guild.id] = {};
            Object.assign(logsData[guild.id], created);
            fs.writeFileSync('./data/logs.json', JSON.stringify(logsData, null, 2));
            const embed = new EmbedBuilder()
              .setColor('#00ff88')
              .setTitle('✅ Logs configurés automatiquement')
              .setDescription('Catégorie et salons de logs créés et enregistrés.')
              .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
          } catch (e) {
            return interaction.reply({ content: '❌ Impossible de créer les salons. Vérifiez les permissions.', ephemeral: true });
          }
        }

        // Demande de mentionner un salon
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`🔧 Configuration du log: ${logType}`)
          .setDescription(`Mentionnez le salon où vous voulez recevoir les logs de type **${logType}**.`)
          .setTimestamp();
  
        await interaction.reply({ embeds: [embed], ephemeral: true });
  
        // Collector de messages corrigé pour que la réponse soit visible
        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 30000 });
  
        collector.on('collect', m => {
          const channel = m.mentions.channels.first();
          if (!channel) {
            return interaction.followUp({ content: '❌ Vous devez mentionner un salon valide !', ephemeral: true });
          }
  
          // Sauvegarde dans le JSON
          const logsData = JSON.parse(fs.readFileSync('./data/logs.json', 'utf8') || '{}');
          if (!logsData[interaction.guild.id]) logsData[interaction.guild.id] = {};
          logsData[interaction.guild.id][logType] = channel.id;
          fs.writeFileSync('./data/logs.json', JSON.stringify(logsData, null, 2));
  
          interaction.followUp({ content: `✅ Le salon ${channel} est maintenant configuré pour les logs **${logType}** !`, ephemeral: true });
        });
  
        collector.on('end', collected => {
          if (collected.size === 0) {
            interaction.followUp({ content: '⏰ Temps écoulé, configuration annulée.', ephemeral: true });
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'interaction:', error);
    }
  });  
  
  client.on("guildMemberAdd", async (member) => {
    try {
      const antiData = JSON.parse(fs.readFileSync('./data/anti.json', 'utf8') || '{}');
      const guildAnti = antiData[member.guild.id];
      
      if (guildAnti?.antibot && member.user.bot) {
        await member.ban({ reason: 'Anti-bot activé' });
        console.log(`🤖 Bot banni automatiquement: ${member.user.tag}`);
        return;
      }

      if (config.autoRoleEnabled && config.autoRole) {
        let role;
        try {
          role = member.guild.roles.cache.get(config.autoRole) || member.guild.roles.cache.find(r => r.name === config.autoRole);
          if (role) {
            await member.roles.add(role);
            console.log(`✅ Rôle "${role.name}" ajouté à ${member.user.tag}`);
          }
        } catch (err) {
          console.error(`❌ Impossible d'ajouter le rôle : ${err.message}`);
        }
      }

      if (config.welcomeEnabled && config.welcomeChannel) {
        try {
          const channel = member.guild.channels.cache.get(config.welcomeChannel);
          if (channel) {
            await channel.send(`Bienvenue sur le serveur, ${member}! 🪙`);
            console.log(`💌 Message de bienvenue envoyé à ${member.user.tag}`);
          }
        } catch (err) {
          console.error(`❌ Impossible d'envoyer le message de bienvenue : ${err.message}`);
        }
      }

      const ghostpingData = JSON.parse(fs.readFileSync('./data/ghostping.json', 'utf8') || '{}');
      const ghostpingChannels = ghostpingData[member.guild.id];
      
      if (ghostpingChannels && ghostpingChannels.length > 0) {
        for (const channelId of ghostpingChannels) {
          const channel = member.guild.channels.cache.get(channelId);
          if (channel) {
            await channel.send(`${member} a rejoint le serveur!`).then(msg => {
              setTimeout(() => msg.delete().catch(() => {}), 1000);
            });
          }
        }
      }

      const captchaData = JSON.parse(fs.readFileSync('./data/captcha.json', 'utf8') || '{}');
      const guildCaptcha = captchaData[member.guild.id];
      
      if (guildCaptcha?.enabled && !member.user.bot) {
        const role = member.guild.roles.cache.get(guildCaptcha.role);
        const channel = member.guild.channels.cache.get(guildCaptcha.channel);
        
        if (role && channel) {
          const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🔐 Captcha Requis')
            .setDescription(`Bienvenue ${member}! Pour accéder au serveur, vous devez résoudre un captcha.\n\n**Captcha:** \`${Math.floor(Math.random() * 9000) + 1000}\`\n\nRépondez avec le nombre affiché ci-dessus.`)
            .setTimestamp();
          
          await channel.send({ content: `${member}`, embeds: [embed] });
        }
      }

      if (config.supportEnabled && !member.user.bot) {
        setTimeout(() => {
          checkSupportStatus(member, config);
        }, 2000);
      }

      // Logs: member join
      try {
        const embed = new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('👤 Membre rejoint')
          .setDescription(`${member} (${member.user.tag}) a rejoint le serveur`)
          .setTimestamp();
        await sendLog(member.guild, 'members', embed);
      } catch (_) {}
    } catch (error) {
      console.error('Erreur lors de l\'arrivée d\'un membre:', error);
    }
  });

  client.on("guildMemberRemove", async (member) => {
    try {
      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('👋 Membre parti')
        .setDescription(`${member.user?.tag || 'Inconnu'} a quitté le serveur`)
        .setTimestamp();
      await sendLog(member.guild, 'members', embed);
    } catch (_) {}
  });

  client.on("presenceUpdate", async (oldPresence, newPresence) => {
    try {
      if (!newPresence || !newPresence.member) return;
      
      if (config.supportEnabled && !newPresence.member.user.bot) {
        checkSupportStatus(newPresence.member, config);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du changement de présence:', error);
    }
  });

  setInterval(async () => {
    try {
      if (!config.supportEnabled || !config.supportStatus || !config.supportRole) return;
      
      for (const guild of client.guilds.cache.values()) {
        const members = await guild.members.fetch();
        
        for (const member of members.values()) {
          if (!member.user.bot) {
            checkSupportStatus(member, config);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification périodique des statuts:', error);
    }
  }, 1 * 60 * 1000); // 1 minute au lieu de 5

  client.on("voiceStateUpdate", async (oldState, newState) => {
    // Handle temp voice without returning early, so logs still run below
    try {
      const tempvocData = JSON.parse(fs.readFileSync('./data/tempvoc.json', 'utf8') || '{}');
      const guildTempvoc = tempvocData[newState.guild.id];
      if (guildTempvoc?.channelId) {
        const triggerChannel = newState.guild.channels.cache.get(guildTempvoc.channelId);
        if (triggerChannel && newState.channelId === triggerChannel.id && !oldState.channelId) {
          const category = newState.guild.channels.cache.find(c => c.type === 4 && c.name === guildTempvoc.categoryName);
          if (category) {
            const tempChannel = await newState.guild.channels.create({
              name: `🔊 ${newState.member.user.username}`,
              type: 2,
              parent: category,
              permissionOverwrites: [
                { id: newState.member.id, allow: ['Connect', 'Speak', 'ManageChannels'] },
                { id: newState.guild.roles.everyone, allow: ['Connect', 'Speak'] }
              ]
            });
            await newState.setChannel(tempChannel);
            const checkEmpty = () => {
              if (tempChannel.members.size === 0) {
                tempChannel.delete().catch(() => {});
              } else {
                setTimeout(checkEmpty, 5000);
              }
            };
            setTimeout(checkEmpty, 5000);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des salons vocaux temporaires:', error);
    }

    // Voice logs
    try {
      const guild = newState.guild || oldState.guild;
      if (!guild) return;
      const member = newState.member || oldState.member;
      if (!member) return;
      let description = null;
      if (!oldState.channelId && newState.channelId) {
        description = `${member.user.tag} a rejoint <#${newState.channelId}>`;
      } else if (oldState.channelId && !newState.channelId) {
        description = `${member.user.tag} a quitté <#${oldState.channelId}>`;
      } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        description = `${member.user.tag} s'est déplacé de <#${oldState.channelId}> vers <#${newState.channelId}>`;
      }
      if (description) {
        const embed = new EmbedBuilder()
          .setColor('#9b59b6')
          .setTitle('🔊 Activité vocale')
          .setDescription(description)
          .setTimestamp();
        await sendLog(guild, 'voice', embed);
      }
    } catch (_) {}
  });

  // Role create/delete
  client.on('roleCreate', async (role) => {
    try {
      const embed = new EmbedBuilder()
        .setColor('#1abc9c')
        .setTitle('🎭 Rôle créé')
        .setDescription(`Rôle créé: ${role} (ID: ${role.id})`)
        .setTimestamp();
      await sendLog(role.guild, 'roles', embed);
    } catch (_) {}
  });

  client.on('roleDelete', async (role) => {
    try {
      const embed = new EmbedBuilder()
        .setColor('#c0392b')
        .setTitle('🎭 Rôle supprimé')
        .setDescription(`Rôle supprimé: ${role.name} (ID: ${role.id})`)
        .setTimestamp();
      await sendLog(role.guild, 'roles', embed);
    } catch (_) {}
  });

  // Member role changes and boosts
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      // Boost
      if (!oldMember.premiumSince && newMember.premiumSince) {
        const embed = new EmbedBuilder()
          .setColor('#e91e63')
          .setTitle('💎 Nouveau boost')
          .setDescription(`${newMember.user.tag} a boosté le serveur !`)
          .setTimestamp();
        await sendLog(newMember.guild, 'boost', embed);
      }

      // Roles diff
      const oldRoles = new Set(oldMember.roles.cache.keys());
      const newRoles = new Set(newMember.roles.cache.keys());

      let added = [...newRoles].filter(id => !oldRoles.has(id));
      let removed = [...oldRoles].filter(id => !newRoles.has(id));

      // Ignore support status role changes in logs
      try {
        if (config.supportEnabled && config.supportRole) {
          const supportRole = newMember.guild.roles.cache.get(config.supportRole) || newMember.guild.roles.cache.find(r => r.name === config.supportRole);
          if (supportRole) {
            const sId = supportRole.id;
            added = added.filter(id => id !== sId);
            removed = removed.filter(id => id !== sId);
          }
        }
      } catch (_) {}

      // Ignore autorole changes in logs
      try {
        if (config.autoRoleEnabled && config.autoRole) {
          const autoRole = newMember.guild.roles.cache.get(config.autoRole) || newMember.guild.roles.cache.find(r => r.name === config.autoRole);
          if (autoRole) {
            const aId = autoRole.id;
            added = added.filter(id => id !== aId);
            removed = removed.filter(id => id !== aId);
          }
        }
      } catch (_) {}

      if (added.length || removed.length) {
        const embed = new EmbedBuilder()
          .setColor('#2980b9')
          .setTitle('🎭 Rôles modifiés')
          .setDescription(`${newMember.user.tag}`)
          .addFields(
            { name: 'Ajoutés', value: added.length ? added.map(id => `<@&${id}>`).join(', ') : 'Aucun', inline: true },
            { name: 'Retirés', value: removed.length ? removed.map(id => `<@&${id}>`).join(', ') : 'Aucun', inline: true },
          )
          .setTimestamp();
        await sendLog(newMember.guild, 'roles', embed);
      }
    } catch (_) {}
  });

  // System errors
  client.on('error', async (err) => {
    try {
      for (const guild of client.guilds.cache.values()) {
        const embed = new EmbedBuilder()
          .setColor('#e67e22')
          .setTitle('⚙️ Erreur système')
          .setDescription('Une erreur est survenue. Voir les logs de la console.')
          .addFields({ name: 'Message', value: String(err.message || err).slice(0, 1024) })
          .setTimestamp();
        await sendLog(guild, 'system', embed);
      }
    } catch (_) {}
  });

  client.login(config.token).catch((err) => {
    console.log(chalk.hex('#E17055')('\n' + '═'.repeat(60)));
    console.log(chalk.hex('#E17055')('❌ ERREUR DE CONNEXION ❌'));
    console.log(chalk.hex('#E17055')('═'.repeat(60)));
    console.log(chalk.hex('#E17055')(`🔑 Token invalide ou problème de connexion`));
    console.log(chalk.hex('#E17055')(`📝 Erreur : ${err.message}`));
    console.log(chalk.hex('#E17055')('═'.repeat(60)));
    console.log(chalk.hex('#FDCB6E')('💡 Vérifiez votre token dans config.json'));
    console.log(chalk.hex('#FDCB6E')('💡 Assurez-vous que le bot est invité sur votre serveur'));
  });
}

main();