import Event from "@event/Event";
import { GuildMember, TextChannel } from "discord.js";
import MyntClient from "~/BotClient";
import { Guild } from "@models/Guild";

export default class GuildMemberUpdate extends Event {
    public constructor() {
        super({ name: "guildMemberUpdate" });
    }



    public async callback(client: MyntClient, oldMember: GuildMember, newMember: GuildMember): Promise<void> {
        try {
            const guild = await client.database.getGuild(oldMember.guild.id);
            if (guild?.config.welcome?.notification && guild.config.welcome.channel && guild.config.welcome.message && guild.config.roles?.member) {
                welcome(client, guild, oldMember, newMember);
            }

            if (guild?.config.autoRemoveNsfw && guild.config.roles?.probation && guild.config.roles.nsfw) {
                nsfwRemove(guild, oldMember, newMember);
            }
        } catch (error) {
            client.emit("error", error);
        }
    }
}

function welcome(client: MyntClient, guild: Guild, oldMember: GuildMember, newMember: GuildMember) {
    const channel = client.channels.cache.get(guild.config.welcome!.channel!);
    if (!channel) {
        return;
    }

    const role = oldMember.guild.roles.cache.get(guild.config.roles!.member!);
    if (!role) {
        return;
    }

    if (newMember.roles.cache.has(role.id) && !oldMember.roles.cache.has(role.id)) {
        const line = guild.config.welcome!.message!.replace("{member}", `<@${newMember.user.id}>`).replace("{server}", newMember.guild.name);
        (channel as TextChannel).send(line);
    }
}

function nsfwRemove(guild: Guild, oldMember: GuildMember, newMember: GuildMember) {
    const probation = guild.config.roles!.probation!;
    const nsfw = guild.config.roles!.nsfw!;

    const oldNsfw = oldMember.roles.cache.has(nsfw);
    const newNsfw = newMember.roles.cache.has(nsfw);
    const oldProbation = oldMember.roles.cache.has(probation);
    const newProbation = newMember.roles.cache.has(probation);

    if (oldNsfw && newNsfw && !oldProbation && newProbation) {
        newMember.roles.remove(nsfw);
    }
}
