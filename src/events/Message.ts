import Event from "@event/Event";
import { Message, TextChannel } from "discord.js";
import BotClient from "~/BotClient";

export default class MessageEvent extends Event {
    public constructor() {
        super({ name: "message" });
    }

    public async callback(client: BotClient, message: Message): Promise<void> {
        try {
            if (message.author.bot) {
                return;
            }

            if (!message.guild) {
                return;
            }

            const guild = await client.database?.getGuild(message.guild.id);
            if (!guild?.config.duplicateDetection || !guild.config.channels?.duplicateSearch) {
                return;
            }

            const channel = message.guild.channels.cache.get(guild.config.channels.duplicateSearch);
            if (!channel) {
                await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateSearch": "" } });
            }

            if (message.channel !== channel) {
                return;
            }

            const fetch = await (channel as TextChannel).messages.fetch({ limit: 100 });
            const messages = fetch.filter(msg => msg.createdTimestamp > Date.now() - 172800000 && msg.content === message.content && msg != message);
            if (messages.size > 0) {
                message.delete();
                message.channel.send("Please wait 48 hours before reposting.")
                    .then((msg) => {
                        setTimeout(() => {
                            msg.delete();
                        }, 10000);
                    });
                return;
            }

            const logs = await client.database.messages.find({ guild: guild.id, user: message.author.id, content: message.content, creation: { "$gt": Date.now() - 172800000 } }).toArray();
            if (logs.length > 0) {
                message.delete();
                message.channel.send("Please wait 48 hours before reposting.")
                    .then((msg) => {
                        setTimeout(() => {
                            msg.delete();
                        }, 10000);
                    });
                return;
            }

        } catch (error) {
            client.emit("error", error);
        }
    }
}
