import discord
from discord.ext import commands
from discord import app_commands
import asyncio
import os

TOKEN = os.environ.get("TOKEN", "TON_TOKEN_ICI")

OWNER_ID = 1275773781536936068

intents = discord.Intents.default()
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)


# ───────── READY ─────────

@bot.event
async def on_ready():

    await bot.tree.sync()

    print(f"✅ Connecté : {bot.user} ({bot.user.id})")

    await bot.change_presence(
        activity=discord.Activity(
            type=discord.ActivityType.watching,
            name="Slayzix Shop"
        )
    )


# ───────── PROGRESS BAR ─────────

def progress_bar(done, total, size=12):

    if total == 0:
        return "░" * size

    filled = int(size * done / total)

    return "█" * filled + "░" * (size - filled)


# ───────── SLASH COMMAND ─────────

@bot.tree.command(name="dmall", description="Envoyer un message à tous les membres")
async def dmall(interaction: discord.Interaction, message: str):

    # OWNER ONLY
    if interaction.user.id != OWNER_ID:

        await interaction.response.send_message(
            "❌ Tu ne peux pas utiliser cette commande.",
            ephemeral=True
        )
        return

    await interaction.response.defer()

    members = [m for m in interaction.guild.members if not m.bot]

    msg = await interaction.followup.send(
        f"📨 Envoi du message à **{len(members)} membres**..."
    )

    ok = 0
    fail = 0
    done = 0

    semaphore = asyncio.Semaphore(10)


    async def worker(member):

        nonlocal ok, fail, done

        async with semaphore:

            try:
                await member.send(message)
                ok += 1

            except:
                fail += 1

            done += 1


    tasks = [worker(m) for m in members]


    async def updater():

        while done < len(members):

            await asyncio.sleep(2)

            bar = progress_bar(done, len(members))

            await msg.edit(
                content=
                f"{bar} `{done}/{len(members)}`\n\n"
                f"✅ Envoyé : **{ok}**\n"
                f"❌ Échec : **{fail}**"
            )


    update_task = asyncio.create_task(updater())

    await asyncio.gather(*tasks)

    update_task.cancel()

    success = round((ok / len(members)) * 100) if members else 0


    await msg.edit(
        content=
        f"✅ **DM terminé**\n\n"
        f"📨 Envoyé : {ok}\n"
        f"❌ Échec : {fail}\n"
        f"📊 Succès : {success}%"
    )


# ───────── RUN ─────────

bot.run(TOKEN)
