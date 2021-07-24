import Event from "@event/Event";
import BotClient from "~/BotClient";
import { Message } from "discord.js";
import { verification } from "@utils/Utils";

export default class MessageUpdate extends Event {
    public constructor() {
        super({ name: "messageUpdate" });
    }

    public async callback(client: BotClient, oldMessage: Message, newMessage: Message): Promise<void> {
        try {
            if (newMessage.partial || newMessage.author.bot) {
                return;
            }

            if (newMessage.content == oldMessage.content) {
                return;
            }

            const guild = newMessage.guild;
            if (!guild) {
                return;
            }

            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (guildDb?.config.verification?.enabled && guildDb.config.verification.password && guildDb.config.verification.channel && oldMessage.channel.id === guildDb.config.verification.channel && guildDb.config.verification.log) {
                verification(newMessage, client);
            }

        } catch (error) {
            client.emit("error", error);
        }
    }
}
