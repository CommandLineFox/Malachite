import Event from "@event/Event";
import BotClient from "~/BotClient";
import { Message, TextChannel } from "discord.js";
import { formatDuration, formatTime, formatUser, sanitize } from "@utils/Utils";

export default class MessageDelete extends Event {
    public constructor() {
        super({ name: "messageDelete" });
    }

    public async callback(client: BotClient, message: Message): Promise<void> {
        try {
            if (message.partial || message.author.bot || message.content.length === 0) {
                return;
            }

            const guild = message.guild;
            if (!guild) {
                return;
            }

            const database = client.database;
            const guildDb = await database.getGuild(guild.id);

            if (!guildDb?.config.duplicates?.detection || !guildDb.config.duplicates.search || !guildDb.config.duplicates.search.includes(message.channel.id) || !guildDb.config.duplicates.log) {
                return;
            }

            const log = guild.channels.cache.get(guildDb.config.duplicates.log) as TextChannel;
            if (!log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateLog": "" } });
                return;
            }

            if (message.createdTimestamp < Date.now() - 5000) {
                const row = await database.messages.findOne({ user: message.author.id, guild: guild.id, content: message.content });
                if (!row) {
                    database.messages.insertOne({ user: message.author.id, guild: guild.id, content: message.content, creation: message.createdTimestamp });
                }
            }

            const date = new Date(Date.now());
            const author = message.author;

            const time = formatTime(date!);
            const user = formatUser(author);
            const channel = formatChannel(message.channel as TextChannel);
            const content = formatMessageDelete(message);
            const creation = formatDuration(message.createdAt, true);
            const file = content.length > 1000 || (content.match(/\n/g) ?? []).length > 12;

            if (file) {
                const content = formatMessageDelete(message, true);
                const line = `${time} <:messageDelete:829444584575598612> Message sent by ${user} has been deleted from ${channel} that was sent **${creation} ago**:\n**Content:**`;
                const attachment = { attachment: Buffer.from(content, "utf8"), name: "DeleteLog.txt" };
                log.send({ content: line, files: [attachment] });
            } else {
                const content = formatMessageDelete(message);
                const line = `${time} <:messageDelete:829444584575598612> Message sent by ${user} has been deleted from ${channel} that was sent **${creation} ago**: ${content}`;
                log.send(line);
            }
        } catch (error) {
            client.emit("error", (error as Error));
        }
    }
}

function formatChannel(channel: TextChannel): string {
    return `**${channel.name}** (<#${channel.id}>)`;
}

function formatMessageDelete(message: Message, file?: boolean): string {
    const content = sanitize(message.cleanContent);
    if (file) {
        return `${content}`;
    }
    return `**\nContent:** ${content}`;
}
