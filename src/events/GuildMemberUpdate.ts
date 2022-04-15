import type { GuildMember, TextChannel } from "discord.js";
import type { BotClient } from "../BotClient";
import Event from "../event/Event";
import type { Guild } from "../models/Guild";

export default class GuildMemberUpdate extends Event {
    public constructor() {
        super("guildMemberUpdate");
    }

    public async callback(client: BotClient, oldMember: GuildMember, newMember: GuildMember): Promise<void> {
        try {
            const guild = await client.database.getGuild(oldMember.guild.id);
            if (guild?.config.welcome?.notification && guild.config.welcome.channel && guild.config.welcome.message && guild.config.roles?.member) {
                welcome(client, guild, oldMember, newMember);
            }

            if (guild?.config.autoRemoveNsfw && guild.config.roles?.probation && guild.config.roles.nsfw) {
                nsfwRemove(guild, oldMember, newMember);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

function welcome(client: BotClient, guild: Guild, oldMember: GuildMember, newMember: GuildMember) {
    const channel = client.channels.cache.get(guild.config.welcome!.channel!);
    if (!channel) {
        return;
    }

    const member = oldMember.guild.roles.cache.get(guild.config.roles!.member!);
    if (!member) {
        return;
    }

    let condition = newMember.roles.cache.has(member.id) && !oldMember.roles.cache.has(member.id);
    if (guild.config.roles?.unverified) {
        const unverified = newMember.guild.roles.cache.get(guild.config.roles.unverified);
        if (unverified) {
            condition = newMember.roles.cache.has(member.id) && !oldMember.roles.cache.has(member.id) && !oldMember.roles.cache.has(guild.config.roles.unverified);
        }
    }

    if (condition) {
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
