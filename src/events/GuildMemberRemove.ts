import type { GuildMember, TextChannel } from "discord.js";
import type { BotClient } from "../BotClient";
import Event from "../event/Event";

export default class GuildMemberRemove extends Event {
    public constructor() {
        super("guildMemberRemove");
    }

    public async callback(client: BotClient, member: GuildMember): Promise<void> {
        try {
            const guild = member.guild;
            const database = client.database;
            const guildDb = await database.getGuild(guild.id);
            if (!guildDb?.config.leaveLog?.channel || !guildDb.config.leaveLog.notification || !guildDb.config.leaveLog.message) {
                return;
            }

            if (!guildDb.config.roles?.member) {
                return;
            }

            const verification = guildDb.verifications.find((verification) => verification.user === member.id);
            if (verification && guildDb.config.verification?.log) {
                const verifyLog = client.channels.cache.get(guildDb.config.verification.log);
                if (verifyLog) {
                    const message = await (verifyLog as TextChannel).messages.fetch(verification.message);
                    await message.edit({ content: `🚪 **${member.user.tag} ${member.id}** has left the server`, components: [] });
                    await database.guilds.updateOne({ id: guild.id }, { "$pull": { "verifications": verification } });
                }
            }

            const role = guild.roles.cache.get(guildDb.config.roles.member);
            if (!role) {
                return;
            }

            if (!member.roles.cache.has(role.id)) {
                return;
            }

            const channel = guild.channels.cache.get(guildDb.config.leaveLog?.channel) as TextChannel;
            if (!channel) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.leaveChannel": "" } });
                return;
            }

            const line = guildDb.config.leaveLog?.message.replace("{member}", member.user.tag).replace("{server}", member.guild.name);
            const message = await channel.send(line);
            if (guildDb.config.leaveLog.emote) {
                await message.react(guildDb.config.leaveLog.emote);
            }
        } catch (error) {
            console.log(error);
        }
    }
}
