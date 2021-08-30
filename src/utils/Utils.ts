import { Guild, GuildMember, Message, TextChannel, User } from "discord.js";
import moment from "moment";
import BotClient from "~/BotClient";

export function splitArguments(argument: string, amount: number): string[] {
    const args = [];
    let element = "";
    let index = 0;

    while (index < argument.length) {
        if (args.length < amount - 1) {
            if (argument[index].match(/\s/)) {
                if (element.trim().length > 0) {
                    args.push(element.trim());
                }

                element = "";
            }
        }
        element += argument[index];
        index++;
    }

    if (element.trim().length > 0) {
        args.push(element.trim());
    }

    return args;
}

export async function getMember(argument: string, guild: Guild): Promise<GuildMember | undefined> {
    if (!argument) {
        return;
    }

    const regex = argument.match(/^((?<username>.+?)#(?<discrim>\d{4})|<?@?!?(?<id>\d{16,18})>?)$/);
    if (regex && regex.groups) {
        if (regex.groups.username) {
            return (await guild.members.fetch({ query: regex.groups.username, limit: 1 })).first();
        } else if (regex.groups.id) {
            return guild.members.fetch(regex.groups.id);
        }
    }

    return (await guild.members.fetch({ query: argument, limit: 1 })).first();
}

export function sanitize(argument: string): string {
    const chars = ["|", "~", "`", "*", "_", "\\", "/"];
    let sanitized = "";

    let index = 0;
    while (index < argument.length) {
        if (chars.includes(argument[index])) {
            sanitized += "\\";
        }

        sanitized += argument[index];
        index++;
    }

    return sanitized;
}

export function formatTime(date: Date, file?: boolean): string {
    if (file) {
        const hours = `0${date.getUTCHours()}`.slice(-2);
        const minutes = `0${date.getUTCMinutes()}`.slice(-2);
        const seconds = `0${date.getUTCSeconds()}`.slice(-2);
        return `[${hours}:${minutes}:${seconds}]`;
    }

    const time = Math.floor(date.getTime() / 1000);
    return `[<t:${time}:T>]`;
}

export function formatDuration(date: Date, withoutSuffix?: boolean): string {
    return moment(date).fromNow(withoutSuffix);
}

export function formatUser(user: User): string {
    return `**${user.tag} (${user.id})**`;
}


export function getDuration(argument: string): number | undefined {
    if (argument.length === 0) {
        return;
    }

    const regex = argument.toLowerCase().match(/^(?<amount>[0-9]+)(?<type>[smhdy]?)$/);
    if (regex && regex.groups) {
        const amount = parseInt(regex.groups.amount);

        switch (regex.groups.type) {
            case "m": {
                return amount * 60 * 1000;
            }

            case "h": {
                return amount * 60 * 60 * 1000;
            }

            case "d": {
                return amount * 24 * 60 * 60 * 1000;
            }

            case "y": {
                return amount * 365 * 24 * 60 * 60 * 1000;
            }

            default: {
                return amount * 1000;
            }
        }
    }

    return;
}

export async function verification(message: Message, client: BotClient): Promise<void> {
    const guild = await client.database.getGuild(message.guild!.id);
    if (!guild?.config.verification?.enabled || !guild.config.verification.channel || !guild.config.verification.log || !guild.config.verification.password) {
        return;
    }
    const password = await detectPassword(message.cleanContent, client, message.guild!.id);
    if (!password) {
        return;
    }

    const channel = client.channels.cache.get(guild?.config.verification.log);
    if (!channel) {
        return;
    }

    const content = `Verification by user: ${formatUser(message.author)}:\n\n${message.cleanContent}`;

    const log = await (channel as TextChannel).send(content);
    await log.react("✅");
    await log.react("❗");
    await log.react("❌");
    await log.react("🔞");

    await client.database.guilds.updateOne({ id: guild.id }, { "$push": { "verifications": { user: message.author.id, message: log.id } } });
    await message.reply("Your request is being checked by staff.");
}

export async function editVerification(message: Message, client: BotClient): Promise<void> {
    const guild = await client.database.getGuild(message.guild!.id);
    if (!guild?.config.verification?.enabled || !guild.config.verification.channel || !guild.config.verification.log || !guild.config.verification.password) {
        return;
    }

    const channel = client.channels.cache.get(guild?.config.verification.log);
    if (!channel) {
        return;
    }

    const verification = guild.verifications.find(verification => verification.user === message.author.id);
    if (!verification) {
        return;
    }

    const log = await (channel as TextChannel).messages.fetch(verification.message);
    const content = `Verification by user: ${formatUser(message.author)}:\n\n${message.cleanContent}`;
    await log.edit(content);
}

async function detectPassword(argument: string, client: BotClient, guild: string): Promise<boolean> {
    const guildDb = await client.database.getGuild(guild);
    if (!guildDb?.config.verification?.password) {
        return false;
    }

    let content = "";
    for (const character of argument) {
        if ((character.toLowerCase() >= "a" && character.toLowerCase() <= "z" || character.match(/\s/))) {
            content += character.toLowerCase();
        }
    }

    if (content.includes(guildDb.config.verification.password)) {
        return true;
    }

    return false;
}
