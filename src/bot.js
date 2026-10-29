import {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} from "discord.js";
import { UptimeTracker } from "./uptime.js";

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("Missing DISCORD_TOKEN. Add your bot token in Replit Secrets.");
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const uptime = new UptimeTracker();
const command = new SlashCommandBuilder()
  .setName("check")
  .setDescription("Check the bot's connection health and uptime.");

client.once(Events.ClientReady, async (readyClient) => {
  try {
    await uptime.load();
    await uptime.start();
    await readyClient.application.commands.set([command]);
    console.info(`Signed in as ${readyClient.user.tag}; /check is registered.`);

    setInterval(() => {
      uptime.record(readyClient.isReady()).catch((error) => {
        console.error("Could not save an uptime sample:", error);
      });
    }, 30_000).unref();
  } catch (error) {
    console.error("Bot startup failed:", error);
    await readyClient.destroy();
    process.exitCode = 1;
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "check") {
    return;
  }

  const connected = client.isReady();
  const ping = client.ws.ping;
  const latencyIsHealthy = Number.isFinite(ping) && ping >= 0 && ping <= 1_000;
  const healthy = connected && latencyIsHealthy;

  try {
    await uptime.record(healthy);
    const summary = uptime.getSummary();
    const embed = new EmbedBuilder()
      .setColor(healthy ? 0x2ecc71 : 0xe74c3c)
      .setTitle(healthy ? "Bot is operational" : "Bot is down")
      .setDescription(
        healthy
          ? "The bot is connected to Discord and responding normally."
          : "The bot connection is unavailable or unhealthy.",
      )
      .addFields(
        {
          name: "Uptime",
          value: `${summary.percentage.toFixed(2)}%`,
          inline: true,
        },
        {
          name: "Discord connection",
          value: connected ? "Connected" : "Disconnected",
          inline: true,
        },
        {
          name: "Gateway latency",
          value: Number.isFinite(ping) && ping >= 0 ? `${Math.round(ping)} ms` : "Unavailable",
          inline: true,
        },
        {
          name: "Tracking since",
          value: `<t:${Math.floor(summary.trackingSince / 1_000)}:R>`,
          inline: true,
        },
      )
      .setFooter({
        text: "Uptime is sampled every 30 seconds and includes observed restart gaps.",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Could not respond to /check:", error);
    const message = "The health check could not be completed. Please try again.";
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
    }
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

process.once("SIGINT", () => {
  console.info("Shutting down.");
  client.destroy();
});
process.once("SIGTERM", () => {
  console.info("Shutting down.");
  client.destroy();
});

client.login(token).catch((error) => {
  console.error("Discord login failed. Check that DISCORD_TOKEN is valid:", error);
  process.exit(1);
});
