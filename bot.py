import discord
from discord.ext import commands, tasks
from discord import Permissions
import random
import asyncio

intents = discord.Intents.default()
intents.message_content = True
intents.members = True  # nécessaire pour kick/ban/autorole

bot = commands.Bot(command_prefix='+', intents=intents)

# -----------------
# READY
# -----------------
@bot.event
async def on_ready():
    print(f'Connecté en tant que {bot.user}')

# -----------------
# MODÉRATION
# -----------------
@bot.slash_command(name="ban", description="Bannir un utilisateur")
async def ban(ctx, member: discord.Member, reason: str = None):
    if ctx.author.guild_permissions.ban_members:
        await member.ban(reason=reason)
        await ctx.respond(f"{member.mention} a été banni !")
    else:
        await ctx.respond("Tu n'as pas la permission de bannir !")

@bot.slash_command(name="kick", description="Expulser un utilisateur")
async def kick(ctx, member: discord.Member, reason: str = None):
    if ctx.author.guild_permissions.kick_members:
        await member.kick(reason=reason)
        await ctx.respond(f"{member.mention} a été expulsé !")
    else:
        await ctx.respond("Tu n'as pas la permission de kick !")

@bot.slash_command(name="mute", description="Mute un utilisateur")
async def mute(ctx, member: discord.Member):
    if ctx.author.guild_permissions.manage_roles:
        mute_role = discord.utils.get(ctx.guild.roles, name="Muted")
        if not mute_role:
            mute_role = await ctx.guild.create_role(name="Muted")
            for channel in ctx.guild.channels:
                await channel.set_permissions(mute_role, send_messages=False, speak=False)
        await member.add_roles(mute_role)
        await ctx.respond(f"{member.mention} a été mute !")
    else:
        await ctx.respond("Tu n'as pas la permission de mute !")

@bot.slash_command(name="unmute", description="Unmute un utilisateur")
async def unmute(ctx, member: discord.Member):
    mute_role = discord.utils.get(ctx.guild.roles, name="Muted")
    if mute_role in member.roles:
        await member.remove_roles(mute_role)
        await ctx.respond(f"{member.mention} a été unmute !")
    else:
        await ctx.respond("L'utilisateur n'était pas mute.")

# -----------------
# WARN
# -----------------
warns = {}

@bot.slash_command(name="warn", description="Avertir un utilisateur")
async def warn(ctx, member: discord.Member, *, reason: str):
    if ctx.author.guild_permissions.kick_members:
        warns.setdefault(member.id, []).append(reason)
        await ctx.respond(f"{member.mention} a été averti ! Total warnings: {len(warns[member.id])}")
    else:
        await ctx.respond("Tu n'as pas la permission !")

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
# ANNOUNCE
# -----------------
@bot.slash_command(name="announce", description="Envoyer une annonce dans un canal")
async def announce(ctx, channel: discord.TextChannel, *, message: str):
    if ctx.author.guild_permissions.manage_messages:
        await channel.send(f"📢 ANNONCE: {message}")
        await ctx.respond("Annonce envoyée !", ephemeral=True)
    else:
        await ctx.respond("Tu n'as pas la permission de faire une annonce.", ephemeral=True)

# -----------------
# GIVEAWAYS, SONDAGES, JEUX...
# -----------------
# (Tu peux réutiliser tout le code des commandes fun / giveaways que j'ai envoyé avant)

bot.run("TON_TOKEN_ICI")
