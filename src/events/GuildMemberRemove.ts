import Event from "@event/Event";
import { GuildMember, TextChannel } from "discord.js";
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
            if (!guildDb?.config.channels?.leaveChannel || !guildDb.config.leaveNotification || !guildDb.config.leaveMessage) {
                return;
            }

            if (!guildDb.config.roles?.member) {
                return;
            }

            const role = guild.roles.cache.get(guildDb.config.roles.member);
            if (!role) {
                return;
            }

            if (!member.roles.cache.has(role.id)) {
                return;
            }

            const channel = guild.channels.cache.get(guildDb.config.channels.leaveChannel) as TextChannel;
            if (!channel) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.leaveChannel": "" } });
                return;
            }

            const line = guildDb.config.leaveMessage.replace("{member}", member.user.tag).replace("{server}", member.guild.name);
            channel.send(line);
        } catch (error) {
            client.emit("error", error);
        }
    }
}
