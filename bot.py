import discord
from discord.ext import commands, tasks
import random
import asyncio
import os

# Token sécurisé via variable d'environnement
TOKEN = os.environ.get("DISCORD_TOKEN")
if not TOKEN:
    raise ValueError("Le token du bot n'est pas défini ! Ajoute DISCORD_TOKEN dans les variables d'environnement.")

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix='+', intents=intents)

# -----------------
# READY
# -----------------
@bot.event
async def on_ready():
    await bot.tree.sync()  # Sync des slash commands
    print(f'Connecté en tant que {bot.user}')

# -----------------
# COMMANDE DM ALL
# -----------------
@bot.command()
async def hayzoxs(ctx, *, message: str):
    """Envoie un DM à tous les membres du serveur (hors bots)."""
    count = 0
    for member in ctx.guild.members:
        if not member.bot:
            try:
                await member.send(message)
                count += 1
            except:
                pass
    await ctx.send(f"Message envoyé à {count} membres du serveur !")

# -----------------
# MODÉRATION
# -----------------
@bot.tree.command(name="ban", description="Bannir un utilisateur")
async def ban(interaction: discord.Interaction, member: discord.Member, reason: str = None):
    if interaction.user.guild_permissions.ban_members:
        await member.ban(reason=reason)
        await interaction.response.send_message(f"{member.mention} a été banni !")
    else:
        await interaction.response.send_message("Tu n'as pas la permission !", ephemeral=True)

@bot.tree.command(name="kick", description="Expulser un utilisateur")
async def kick(interaction: discord.Interaction, member: discord.Member, reason: str = None):
    if interaction.user.guild_permissions.kick_members:
        await member.kick(reason=reason)
        await interaction.response.send_message(f"{member.mention} a été expulsé !")
    else:
        await interaction.response.send_message("Tu n'as pas la permission !", ephemeral=True)

@bot.tree.command(name="mute", description="Mute un utilisateur")
async def mute(interaction: discord.Interaction, member: discord.Member):
    if interaction.user.guild_permissions.manage_roles:
        mute_role = discord.utils.get(interaction.guild.roles, name="Muted")
        if not mute_role:
            mute_role = await interaction.guild.create_role(name="Muted")
            for channel in interaction.guild.channels:
                await channel.set_permissions(mute_role, send_messages=False, speak=False)
        await member.add_roles(mute_role)
        await interaction.response.send_message(f"{member.mention} a été mute !")
    else:
        await interaction.response.send_message("Tu n'as pas la permission !", ephemeral=True)

@bot.tree.command(name="unmute", description="Unmute un utilisateur")
async def unmute(interaction: discord.Interaction, member: discord.Member):
    mute_role = discord.utils.get(interaction.guild.roles, name="Muted")
    if mute_role in member.roles:
        await member.remove_roles(mute_role)
        await interaction.response.send_message(f"{member.mention} a été unmute !")
    else:
        await interaction.response.send_message("L'utilisateur n'était pas mute.", ephemeral=True)

# -----------------
# WARN
# -----------------
warns = {}

@bot.tree.command(name="warn", description="Avertir un utilisateur")
async def warn(interaction: discord.Interaction, member: discord.Member, reason: str):
    if interaction.user.guild_permissions.kick_members:
        warns.setdefault(member.id, []).append(reason)
        await interaction.response.send_message(f"{member.mention} a été averti ! Total warnings: {len(warns[member.id])}")
    else:
        await interaction.response.send_message("Tu n'as pas la permission !", ephemeral=True)

# -----------------
# AUTOMODO / ANTI-SPAM
# -----------------
blocked_words = ["spamword1", "spamword2", "lieninterdit"]  # personnaliser

@bot.event
async def on_message(message):
    if message.author.bot:
        return
    for word in blocked_words:
        if word in message.content.lower():
            await message.delete()
            await message.channel.send(f"{message.author.mention}, mot interdit !", delete_after=5)
    await bot.process_commands(message)

# -----------------
# AUTOROLE
# -----------------
@bot.event
async def on_member_join(member):
    role = discord.utils.get(member.guild.roles, name="Membre")
    if role:
        await member.add_roles(role)
        try:
            await member.send(f"Bienvenue {member.name}, tu as reçu le rôle {role.name} !")
        except:
            pass

# -----------------
# GIVEAWAYS
# -----------------
@bot.tree.command(name="giveaway", description="Créer un giveaway")
async def giveaway(interaction: discord.Interaction, duration: int, prize: str):
    embed = discord.Embed(title="🎉 Giveaway !", description=f"Prix: {prize}\nDurée: {duration}s", color=discord.Color.gold())
    message = await interaction.channel.send(embed=embed)
    await message.add_reaction("🎉")
    await interaction.response.send_message(f"Giveaway lancé pour {duration} secondes !", ephemeral=True)
    await asyncio.sleep(duration)
    users = set()
    for reaction in message.reactions:
        if str(reaction.emoji) == "🎉":
            async for user in reaction.users():
                if not user.bot:
                    users.add(user)
    if users:
        winner = random.choice(list(users))
        await interaction.channel.send(f"Félicitations {winner.mention} ! Tu as gagné **{prize}** !")
    else:
        await interaction.channel.send(f"Aucun participant pour **{prize}** 😢")

# -----------------
# SONDAGE
# -----------------
@bot.tree.command(name="sondage", description="Créer un sondage rapide")
async def sondage(interaction: discord.Interaction, question: str):
    embed = discord.Embed(title="📊 Sondage", description=question, color=discord.Color.purple())
    message = await interaction.channel.send(embed=embed)
    await message.add_reaction("✅")
    await message.add_reaction("❌")
    await interaction.response.send_message("Sondage créé !", ephemeral=True)

# -----------------
# JEUX FUN
# -----------------
words = ["python", "discord", "bot", "serveur", "draftbot"]
games = {}

@bot.tree.command(name="pendu", description="Jouer au pendu")
async def pendu(interaction: discord.Interaction):
    word = random.choice(words)
    games[interaction.user.id] = {"word": word, "guessed": ["_"]*len(word), "tries": 6}
    await interaction.response.send_message(f"Pendu lancé ! {' '.join(games[interaction.user.id]['guessed'])} | Essais restants : 6")

@bot.tree.command(name="guess", description="Deviner une lettre pour le pendu")
async def guess(interaction: discord.Interaction, letter: str):
    if interaction.user.id not in games:
        await interaction.response.send_message("Tu n'as pas de partie en cours. Lance `/pendu` !")
        return
    game = games[interaction.user.id]
    word = game["word"]
    guessed = game["guessed"]
    tries = game["tries"]
    if letter in word:
        for i, c in enumerate(word):
            if c == letter:
                guessed[i] = letter
    else:
        game["tries"] -= 1
    if "_" not in guessed:
        await interaction.response.send_message(f"Félicitations ! Tu as trouvé le mot : {word}")
        del games[interaction.user.id]
    elif game["tries"] <= 0:
        await interaction.response.send_message(f"Perdu ! Le mot était : {word}")
        del games[interaction.user.id]
    else:
        await interaction.response.send_message(f"{' '.join(guessed)} | Essais restants : {game['tries']}")

@bot.tree.command(name="chifumi", description="Pierre, Feuille, Ciseaux")
async def chifumi(interaction: discord.Interaction, choix: str):
    choix = choix.lower()
    options = ["pierre", "feuille", "ciseaux"]
    if choix not in options:
        await interaction.response.send_message("Choisis entre pierre, feuille ou ciseaux !")
        return
    bot_choice = random.choice(options)
    if choix == bot_choice:
        resultat = "Égalité !"
    elif (choix == "pierre" and bot_choice == "ciseaux") or \
         (choix == "feuille" and bot_choice == "pierre") or \
         (choix == "ciseaux" and bot_choice == "feuille"):
        resultat = "Tu gagnes ! 🎉"
    else:
        resultat = "Je gagne ! 🤖"
    await interaction.response.send_message(f"Tu: {choix}, Bot: {bot_choice} → {resultat}")

# -----------------
# LANCEMENT DU BOT
# -----------------
bot.run(TOKEN)
