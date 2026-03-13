import discord
from discord.ext import commands
import asyncio
import os

# ── Config ──────────────────────────────────────────────
TOKEN = os.environ.get("TOKEN", "TON_TOKEN_ICI")
PREFIX = "/"
RED = 0xE74C3C
# ────────────────────────────────────────────────────────

intents = discord.Intents.default()
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix=PREFIX, intents=intents)

# ── Helpers ─────────────────────────────────────────────
def red_embed(description, title=""):
    e = discord.Embed(title=title, description=description, color=RED)
    e.timestamp = discord.utils.utcnow()
    return e

def progress_bar(done, total, length=10):
    filled = int(length * done / total) if total else 0
    return "█" * filled + "░" * (length - filled)

# ── Events ──────────────────────────────────────────────
@bot.event
async def on_ready():
    print(f"✅ Connecté en tant que {bot.user} ({bot.user.id})")
    await bot.change_presence(activity=discord.Activity(
        type=discord.ActivityType.watching,
        name="Slayzix Shop"
    ))

# ── Commands ─────────────────────────────────────────────
@bot.command(name="dmall")
@commands.has_permissions(administrator=True)
async def dmall_cmd(ctx, *, message: str):
    await ctx.message.delete()

    members = [m for m in ctx.guild.members if not m.bot]

    confirm = await ctx.send(embed=red_embed(
        f"Envoyer à **{len(members)}** membres :\n\n*{message}*\n\nRéponds `oui` pour confirmer.",
        "📨 DM All — Confirmation"
    ))

    try:
        await bot.wait_for(
            "message",
            check=lambda m: m.author == ctx.author and m.channel == ctx.channel and m.content.lower() == "oui",
            timeout=30
        )
    except asyncio.TimeoutError:
        await confirm.delete()
        await ctx.send(embed=red_embed("❌ Annulé (timeout)."), delete_after=5)
        return

    await confirm.delete()

    prog_msg = await ctx.send(embed=red_embed("📨 Démarrage de l'envoi...", "📨 DM All"))

    ok = fail = 0

    dm_embed = discord.Embed(
        title="📨 Message de Slayzix Shop",
        description=message,
        color=RED
    )
    dm_embed.set_footer(text="Slayzix Shop")
    dm_embed.timestamp = discord.utils.utcnow()

    for i, m in enumerate(members, 1):
        try:
            # content= permet au lien d'être cliquable en dehors de l'embed
            await m.send(content=message, embed=dm_embed)
            ok += 1
        except Exception:
            fail += 1

        if i % 10 == 0 or i == len(members):
            bar = progress_bar(i, len(members))
            await prog_msg.edit(embed=red_embed(
                f"{bar} `{i}/{len(members)}`\n\n✅ Envoyé: **{ok}**\n❌ Échec: **{fail}**",
                "📨 DM All en cours..."
            ))

        await asyncio.sleep(0.1)

    await prog_msg.edit(embed=red_embed(
        f"✅ Envoyé: **{ok}**\n❌ Échec: **{fail}**\n\nTaux de succès: **{round(ok / len(members) * 100)}%**",
        "✅ DM All terminé"
    ))


@dmall_cmd.error
async def dmall_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send(embed=red_embed("❌ Tu n'as pas la permission administrateur."), delete_after=5)
    elif isinstance(error, commands.MissingRequiredArgument):
        await ctx.send(embed=red_embed(f"❌ Usage : `{PREFIX}dmall <message>`"), delete_after=5)

# ── Run ──────────────────────────────────────────────────
bot.run(TOKEN)
