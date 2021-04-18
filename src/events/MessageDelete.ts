import Event from "@event/Event";
import BotClient from "~/BotClient";
import { Message, TextChannel } from "discord.js";
import { formatTime, formatUser, sanitize } from "@utils/Utils";

export default class MessageDelete extends Event {
    public constructor() {
        super({ name: "messageDelete" });
    }

    public async callback(client: BotClient, message: Message): Promise<void> {
        try {
            if (message.author.bot) {
                return;
            }

            if (message.content.length === 0) {
                return;
            }

            const guild = message.guild;
            if (!guild) {
                return;
            }

            const database = client.database;
            const guildDb = await database.getGuild(guild.id);

            if (!guildDb?.config.duplicateDetection || !guildDb.config.channels?.duplicateSearch || message.channel.id !== guildDb.config.channels.duplicateSearch || !guildDb.config.channels.duplicateLog) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.channels.duplicateLog) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateLog": "" } });
                return;
            }

            database.messages.insertOne({ user: message.author.id, guild: guild.id, content: message.content, creation: message.createdTimestamp });
            const date = new Date(Date.now());
            const author = message.author;

            const time = formatTime(date!);
            const user = formatUser(author);
            const channel = formatChannel(message.channel as TextChannel);
            const content = formatMessageDelete(message);
            const file = content.length > 1000 || (content.match(/\n/g) ?? []).length > 12;

            if (file) {
                const content = formatMessageDelete(message, true);
                const line = `${time} <:messageDelete:829444584575598612> Message sent by ${user} has been edited ${channel}:`;
                const attachment = { attachment: Buffer.from(content, "utf8"), name: "DeleteLog.txt" };
                log.send(line, { files: [attachment] });
            } else {
                const content = formatMessageDelete(message);
                const line = `${time} <:messageDelete:829444584575598612> Message sent by ${user} has been edited ${channel}: ${content}`;
                log.send(line);
            }
        } catch (error) {
            client.emit("error", error);
        }
    }
}

function formatChannel(channel: TextChannel): string {
    return `in the **${channel.name}** (<#${channel.id}>) channel`;
}

function formatMessageDelete(message: Message, file?: boolean): string {
    const content = sanitize(message.cleanContent);
    if (file) {
        return `Content: ${content}`;
    }
    return `**\nContent:** ${content}`;
}
