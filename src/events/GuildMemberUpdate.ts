import { AuditLogEvent, GuildMember, TextChannel } from "discord.js";
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
                await welcome(client, guild, oldMember, newMember);
            }

            if (guild?.config.autoRemoveNsfw && guild.config.roles?.probation && guild.config.roles.nsfw) {
                await nsfwRemove(guild, oldMember, newMember);
            }

            if (guild?.config.verifiedLog?.enabled) {
                await checkVerified(guild, oldMember, newMember);
            }
        } catch (error) {
            console.log(error);
        }
    }
}

async function welcome(client: BotClient, guild: Guild, oldMember: GuildMember, newMember: GuildMember) {
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
        await (channel as TextChannel).send(line);
    }
}

async function nsfwRemove(guild: Guild, oldMember: GuildMember, newMember: GuildMember) {
    const probation = guild.config.roles!.probation!;
    const nsfw = guild.config.roles!.nsfw!;

    const oldNsfw = oldMember.roles.cache.has(nsfw);
    const newNsfw = newMember.roles.cache.has(nsfw);
    const oldProbation = oldMember.roles.cache.has(probation);
    const newProbation = newMember.roles.cache.has(probation);

    if (oldNsfw && newNsfw && !oldProbation && newProbation) {
        await newMember.roles.remove(nsfw);
    }
}

async function checkVerified(guild: Guild, oldMember: GuildMember, newMember: GuildMember) {
    const verified = guild.config.roles?.verified;
    if (!verified) {
        return;
    }

    const probation = guild.config.roles?.probation;
    if (!probation) {
        return;
    }

    const oldVerified = oldMember.roles.cache.has(verified);
    const newVerified = newMember.roles.cache.has(verified);

    const oldProbation = oldMember.roles.cache.has(probation);
    const newProbation = newMember.roles.cache.has(probation);

    if ((oldVerified && !newVerified) || (!newVerified && oldProbation && !newProbation)) {
        return;
    }

    const audit = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberRoleUpdate });
    const entry = audit.entries.first();
    if (!entry) {
        return;
    }

    const executor = entry.executor;
    if (!executor) {
        return;
    }

    const verifiedLog = guild.config.verifiedLog?.channel;
    if (!verifiedLog) {
        return;
    }

    const channel = await newMember.guild.channels.fetch(verifiedLog);
    if (!channel) {
        return;
    }

    if (!oldProbation && !newProbation) {
        if (executor.bot && entry.reason) {
            const member = await newMember.guild.members.fetch(entry.reason);
            await (channel as TextChannel).send(`Verified ${newMember.user} (${newMember.id}) by ${member.user.tag}`);
        } else {
            await (channel as TextChannel).send(`Verified ${newMember.user} (${newMember.id}) by ${executor.tag}`);
        }
    }

    if (!oldProbation && newProbation) {
        const message = (channel as TextChannel).lastMessage;
        if (!message || message.author.id !== newMember.guild.members.me!.id) {
            return;
        }

        await message.edit(`Put on Probation and ${message.content}`);
    }
}