import Event from "@event/Event";
import { GuildMember } from "discord.js";
import MyntClient from "~/BotClient";

export default class GuildMemberRemove extends Event {
    public constructor() {
        super({ name: "guildMemberRemove" });
    }

    public async callback(client: MyntClient, member: GuildMember): Promise<void> {
        try {
            const guild = member.guild;
            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (!guildDb?.config.leaveLog?.channel || !guildDb.config.leaveLog.notification || !guildDb.config.leaveLog.message) {
                return;
            }

            if (guildDb.config.roles?.unverified && guildDb.config.autoAddUnverified) {
                const role = guild.roles.cache.get(guildDb.config.roles.unverified);
                if (role) {
                    member.roles.add(role);
                }
            }

        } catch (error) {
            client.emit("error", error);
        }
    }
}
