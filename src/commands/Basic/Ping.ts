import Command from "@command/Command";
import { Basic } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { MessageEmbed, Message } from "discord.js";

export default class Ping extends Command {
    public constructor() {
        super({
            name: "Ping",
            triggers: ["ping"],
            description: "Shows the bot's response time",
            group: Basic,
            botPermissions: ["EMBED_LINKS"]
        });
    }

    public run(event: CommandEvent): void {
        const client = event.client;
        try {
            event.send("Pinging...")
                .then(async (msg) => {
                    msg = msg as Message;
                    const ping = new MessageEmbed()
                        .addField(":hourglass: Response time: ", `${msg.createdTimestamp - event.message.createdTimestamp}ms`, false)
                        .addField(":heartbeat: Bot ping: ", `${Math.round(event.client.ws.ping)}ms`, true);
                    await msg.edit({ content: null, embeds: [ping] });
                });
        } catch (error) {
            client.emit("error", (error as Error));
        }
    }
}
