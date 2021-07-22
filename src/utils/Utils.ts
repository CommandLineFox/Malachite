import { Guild, GuildMember, User } from "discord.js";
import moment from "moment";

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
