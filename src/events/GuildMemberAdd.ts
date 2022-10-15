import type { GuildMember } from "discord.js";
import type { BotClient } from "../BotClient";
import Event from "../event/Event";

export default class GuildMemberAdd extends Event {
    public constructor() {
        super("guildMemberAdd");
    }

    public async callback(client: BotClient, member: GuildMember): Promise<void> {
        try {
            const guild = member.guild;
            const database = client.database;
            const guildDb = await database.getGuild(guild.id);

            if (guildDb?.config.roles?.unverified && guildDb.config.autoAddUnverified) {
                const role = guild.roles.cache.get(guildDb.config.roles.unverified);
                if (role) {
                    await member.roles.add(role);
                }
            }

        } catch (error) {
            console.log(error);
        }
    }
}
