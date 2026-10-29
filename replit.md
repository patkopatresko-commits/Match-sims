# Discord bot setup

This project runs a Discord bot that registers a global `/check` command when it
connects. The command posts an embed with the bot's connection status, Discord
Gateway latency, and sampled uptime percentage.

## Configure the bot

1. Revoke any bot token that was shared in chat or otherwise exposed. Generate a
   replacement in the Discord Developer Portal.
2. Add the replacement as the `DISCORD_TOKEN` secret in Replit. Never put a real
   token in source code, `.env.example`, or chat.
3. Invite the application to your server with the `bot` and
   `applications.commands` OAuth scopes. The bot needs permission to send
   messages and embed links.
4. Start the `Discord bot` workflow with `npm start`. The global slash command
   can take a little while to appear in Discord.

## Keep it running

The project is configured for a Replit Reserved VM deployment, which is intended
for continuously running services such as Discord bots. Review the deployment's
compute and pricing settings, then publish it from Replit. A workspace workflow
is useful for development, but it is not a substitute for publishing an
always-on deployment.

## Uptime reporting

The bot samples its Discord connection every 30 seconds and stores aggregate
measurements in `data/uptime.json`. The percentage is measured since monitoring
first started; the tracker counts unobserved restart gaps as downtime. This
local file is intentionally excluded from Git.

`/check` can only respond while Discord can deliver an interaction to the bot.
If the process is completely offline, Discord cannot deliver the command to it;
an independent external monitor is needed to notify a channel while the bot is
down.
