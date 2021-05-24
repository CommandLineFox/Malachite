import Event from "@event/Event";
import { Message, TextChannel } from "discord.js";
import BotClient from "~/BotClient";
import moment from "moment";

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

            const delay = guild.config.time;
            if (!delay) {
                return;
            }

            const fetch = (await (channel as TextChannel).messages.fetch({ limit: 100 })).array();
            const messages = fetch.filter(msg => msg.createdTimestamp > Date.now() - delay && msg.channel === message.channel && msg.author === message.author && msg.content === message.content && msg != message)
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

            if (messages.length > 0) {
                message.delete();

                const time = messages[messages.length - 1].createdTimestamp;
                const difference = moment(time! + delay).fromNow(true);
                message.channel.send(`<@${message.author.id}> please wait ${difference} before reposting.`)
                    .then((msg) => {
                        setTimeout(() => {
                            msg.delete();
                        }, 10000);
                    });
                return;
            }

            const logs = (await client.database.messages.find({ guild: guild.id, user: message.author.id, content: message.content, creation: { "$gt": Date.now() - delay } }).toArray()).sort((a, b) => a.creation - b.creation);
            if (logs.length > 0) {
                message.delete();

                const time = logs[logs.length - 1].creation;
                const difference = moment(time! + delay).fromNow(true);
                message.channel.send(`<@${message.author.id}> please wait ${difference} before reposting.`)
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
