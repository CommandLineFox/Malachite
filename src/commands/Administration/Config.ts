import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { MessageEmbed } from "discord.js";
import { formatDuration, getDuration, splitArguments } from "@utils/Utils";
import { DisplayData } from "~/utils/Types";

export default class Config extends Command {
    public constructor() {
        super({
            name: "Config",
            triggers: ["config", "cfg", "setup"],
            description: "Configures various settings for the guild",
            group: Administration,
            botPermissions: ["EMBED_LINKS", "MANAGE_ROLES"]
        });
    }

    protected async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        try {
            const database = client.database;
            const guild = await database.getGuild(event.guild.id);
            if (!guild) {
                return;
            }

            const [subcommand, option, args] = splitArguments(event.argument, 3);
            if (!subcommand) {
                await displayAllSettings(event, guild);
                return;
            }

            switch (subcommand.toLowerCase()) {
                case "prefix": {
                    await prefixSettings(event, option, args, guild);
                    break;
                }

                case "staff": {
                    await moderatorSettings(event, option, args, guild);
                    break;
                }

                case "detection": {
                    await duplicateDetectionSettings(event, option, guild);
                    break;
                }

                case "search": {
                    await duplicateSearchSettings(event, option, args, guild);
                    break;
                }

                case "log": {
                    await duplicateLogSettings(event, option, args, guild);
                    break;
                }

                case "time": {
                    await timeSettings(event, option, args, guild);
                    break;
                }

                case "leavemessage": {
                    await leaveMessageSettings(event, option, args, guild);
                    break;
                }

                case "leavenotification": {
                    await leaveNotificationSettings(event, option, guild);
                    break;
                }

                case "leavechannel": {
                    await leaveChannelSettings(event, option, args, guild);
                    break;
                }

                case "leaveemote": {
                    await leaveEmoteSettings(event, option, args, guild);
                    break;
                }

                case "member": {
                    await memberRoleSettings(event, option, args, guild);
                    break;
                }

                case "unverified": {
                    await unverifiedRoleSettings(event, option, args, guild);
                    break;
                }

                case "verificationchannel": {

                    break;
                }

                case "verificationlog": {

                    break;
                }

                case "welcomechannel": {

                    break;
                }

                case "welcomemessage": {

                    break;
                }

                case "welcomenotification": {

                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

async function prefixSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "prefix", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            if (args.length > 5) {
                event.send("The prefix can be up to 5 characters.");
                break;
            }

            await database.guilds.updateOne({ id: guild?.id }, { "$set": { "config.prefix": args } });
            await event.send(`The prefix has been set to \`${args}\``);
            break;
        }

        case "reset": {
            await database.guilds.updateOne({ id: guild?.id }, { "$unset": { "config.prefix": "" } });
            await event.send(`The prefix has been set to \`${client.config.prefix}\``);
            break;
        }
    }
}

async function moderatorSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "moderators", true);
        return;
    }

    if (!args) {
        event.send("You need to specify a role.");
        return;
    }

    const role = event.guild.roles.cache.find(role => role.id === args || role.name === args || `<@&${role.id}>` === args);
    if (!role) {
        await event.send("Couldn't find the role you're looking for.");
        return;
    }

    switch (option.toLowerCase()) {
        case "add": {
            if (guild.config.roles?.moderator?.includes(role.id)) {
                await event.send("The specified role is already a moderator role.");
                break;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$push": { "config.roles.moderator": role.id } });
            await event.send(`Added \`${role.name}\` as a moderator role.`);
            break;
        }
        case "remove": {
            if (!guild.config.roles?.moderator?.includes(role.id)) {
                event.send("The specified role isn't a moderator role.");
                break;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": role.id } });
            await event.send(`\`${role.name}\` is no longer a moderator role.`);
            break;
        }
    }
}

async function duplicateDetectionSettings(event: CommandEvent, option: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "detection", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "enable": {
            if (guild.config.duplicates?.detection === true) {
                event.send("Detection is already enabled.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicates.detection": true } });
            await event.send("Successfully enabled detection of duplicates.");
            break;
        }

        case "disable": {
            if (guild.config.duplicates?.detection !== true) {
                event.send("Detection is already disabled.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.detection": "" } });
            await event.send("Successfully disabled detection of duplicates.");
            break;
        }
    }
}

async function duplicateSearchSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "search", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const channel = event.guild.channels.cache.find(channel => channel.name === args || channel.id === args || `<#${channel.id}>` === args);
            if (!channel) {
                event.send("Couldn't find the channel you're looking for.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicates.search": channel.id } });
            await event.send(`The channel to search for duplicate messages in has been set to \`${channel.name}\`.`);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.search": "" } });
            await event.send("The channel to search for duplicate messages in has been removed.");
            break;
        }
    }
}

async function duplicateLogSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "deletion", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const channel = event.guild.channels.cache.find(channel => channel.name === args || channel.id === args || `<#${channel.id}>` === args);
            if (!channel) {
                event.send("Couldn't find the channel you're looking for.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicates.log": channel.id } });
            await event.send(`The channel to log deleted messages in has been set to \`${channel.name}\`.`);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.log": "" } });
            await event.send("The channel to log deleted messages in has been removed.");
            break;
        }
    }
}

async function timeSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "time", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const duration = getDuration(args);
            if (!duration) {
                event.send("You need to enter a valid number of ms.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicates.time": duration } });
            await event.send(`The time period has been set to \`${formatDuration(new Date(Date.now() + duration), true)}\`.`);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.time": "" } });
            await event.send("The time period has been removed.");
            break;
        }
    }
}

async function leaveChannelSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "leavechannel", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const channel = event.guild.channels.cache.find(channel => channel.name === args || channel.id === args || `<#${channel.id}>` === args);
            if (!channel) {
                event.send("Couldn't find the channel you're looking for.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.leaveLog.channel": channel.id } });
            await event.send(`The channel to send leave notifications in has been set to \`${channel.name}\`.`);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.leaveLog.channel": "" } });
            await event.send("The channel to search for duplicate messages in has been removed.");
            break;
        }
    }
}

async function leaveNotificationSettings(event: CommandEvent, option: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "leavenotification", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "enable": {
            if (guild.config.leaveLog?.notification === true) {
                event.send("Leave notifications are already enabled.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$set": { "config.leaveLog.notification": true } });
            await event.send("Successfully enabled leave notifications.");
            break;
        }

        case "disable": {
            if (guild.config.leaveLog?.notification !== true) {
                event.send("Leave notifications are already disabled.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.leaveLog.notification": "" } });
            await event.send("Successfully disabled leave notificatons.");
            break;
        }
    }
}

async function leaveMessageSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "leavemessage", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            await database.guilds.updateOne({ id: guild?.id }, { "$set": { "config.leaveLog.message": args } });
            await event.send(`The leave message has been set to \`${args}\``);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild?.id }, { "$unset": { "config.leaveLog.message": "" } });
            await event.send("The leave message has been removed");
            break;
        }
    }
}

async function leaveEmoteSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;

    if (!option) {
        await displayData(event, guild, "leaveemote", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            await database.guilds.updateOne({ id: guild?.id }, { "$set": { "config.leaveLog.emote": args } });
            await event.send(`The leave emote has been set to ${args}`);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild?.id }, { "$unset": { "config.leaveLog.emote": "" } });
            await event.send("The leave emote has been removed");
            break;
        }
    }
}

async function memberRoleSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "member", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const member = args;

            if (!member) {
                event.send("You need to specify a role.");
                return;
            }

            const role = event.guild.roles.cache.find(role => role.id === member || role.name === member || `<@&${role.id}>` === member);

            if (!role) {
                event.send("Couldn't find the role you're looking for.");
                return;
            }

            if (guild.config.roles?.member === role.id) {
                event.send("The specified role is already set as the member role.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.member": role.id } });
            await event.send(`Set \`${role.name}\` as the member role.`);
            break;
        }

        case "remove": {
            if (!guild.config.roles?.member) {
                event.send("No role is specified as the member role.");
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.member);
            if (!role) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.member": "" } });
                await event.send("The role that used to be the member role was deleted or can't be found.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.member": "" } });
            await event.send(`\`${role.name}\` is no longer the member role.`);
            break;
        }
    }
}

async function unverifiedRoleSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const database = event.client.database;

    if (!option) {
        await displayData(event, guild, "unverified", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const member = args;

            if (!member) {
                event.send("You need to specify a role.");
                return;
            }

            const role = event.guild.roles.cache.find(role => role.id === member || role.name === member || `<@&${role.id}>` === member);

            if (!role) {
                event.send("Couldn't find the role you're looking for.");
                return;
            }

            if (guild.config.roles?.member === role.id) {
                event.send("The specified role is already set as the unverified role.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.unverified": role.id } });
            await event.send(`Set \`${role.name}\` as the unverified role.`);
            break;
        }

        case "remove": {
            if (!guild.config.roles?.unverified) {
                event.send("No role is specified as the unverified role.");
                return;
            }

            const role = event.guild.roles.cache.get(guild.config.roles.unverified);
            if (!role) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.unverified": "" } });
                await event.send("The role that used to be the unverified role was deleted or can't be found.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.unverified": "" } });
            await event.send(`\`${role.name}\` is no longer the unverified role.`);
            break;
        }
    }
}

async function displayAllSettings(event: CommandEvent, guild: Guild) {
    const embed = new MessageEmbed()
        .setTitle("The current settings for this server:")
        .addField("Prefix", await displayData(event, guild, "prefix"), true)
        .addField("Moderators", await displayData(event, guild, "moderators"), true)
        .addField("Duplicate detection", await displayData(event, guild, "detection"), true)
        .addField("Duplicate search", await displayData(event, guild, "search"), true)
        .addField("Deletion log", await displayData(event, guild, "deletion"), true)
        .addField("Time", await displayData(event, guild, "time"), true)
        .addField("Member role", await displayData(event, guild, "member"), true)
        .addField("Leave notifications", await displayData(event, guild, "leavenotification"), true)
        .addField("Leave channel", await displayData(event, guild, "leavechannel"), true)
        .addField("Leave message", await displayData(event, guild, "leavemessage"), true)
        .addField("Leave emote", await displayData(event, guild, "leaveemote"), true)
        .addField("Unverified role", await displayData(event, guild, "unverified"), true)
        .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

    event.send({ embed: embed });
}

async function displayData(event: CommandEvent, guild: Guild, type: DisplayData, specific?: boolean): Promise<any> {
    const client = event.client;
    const database = client.database;
    if (!specific) {
        switch (type.toLowerCase()) {
            case "prefix": {
                return guild.config.prefix ?? client.config.prefix;
            }

            case "moderators": {
                const mods = guild.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    return "There is no moderator roles.";
                }

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                return list;
            }

            case "detection": {
                return guild.config.duplicates?.detection === true ? "Enabled" : "Disabled";
            }

            case "search": {
                if (!guild.config.duplicates?.search) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.search": "" } });
                    return "None";
                }

                return `${event.guild.channels.cache.get(guild.config.duplicates.search)}`;
            }

            case "deletion": {
                if (!guild.config.duplicates?.log) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.log": "" } });
                    return "None";
                }

                return `${event.guild.channels.cache.get(guild.config.duplicates.log)}`;
            }

            case "time": {
                if (!guild.config.duplicates?.time) {
                    return "Not set";
                }

                return `${formatDuration(new Date(Date.now() + guild.config.duplicates.time), true)}`;
            }

            case "leavenotification": {
                return guild.config.leaveLog?.notification === true ? "Enabled" : "Disabled";
            }

            case "leavechannel": {
                if (!guild.config.leaveLog?.channel) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.leaveLog.channel": "" } });
                    return "None";
                }

                return `${event.guild.channels.cache.get(guild.config.leaveLog.channel)}`;
            }

            case "leavemessage": {
                if (!guild.config.leaveLog?.message) {
                    return "None";
                }

                return guild.config.leaveLog.message;
            }


            case "leaveemote": {
                if (!guild.config.leaveLog?.emote) {
                    return "None";
                }

                return guild.config.leaveLog.emote;
            }

            case "member": {
                if (!guild.config.roles) {
                    return "Not set up";
                }

                const id = guild.config.roles.member;
                if (!id) {
                    return "No mute role";
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.member": "" } });
                    return "No member role";
                }

                return role.name;
            }

            case "unverified": {
                if (!guild.config.roles) {
                    return "Not set up";
                }

                const id = guild.config.roles.unverified;
                if (!id) {
                    return "No unverified role";
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.unverified": "" } });
                    return "No unverified role";
                }

                return role.name;
            }
        }
    } else {
        switch (type.toLowerCase()) {
            case "prefix": {
                event.send(`The prefix is currently set to \`${guild.config.prefix ?? client.config.prefix}\``);
                break;
            }

            case "moderators": {
                const mods = guild.config.roles?.moderator;
                if (!mods || mods.length === 0) {
                    event.send("There is no moderator roles.");
                    return;
                }

                const embed = new MessageEmbed()
                    .setTitle("The following roles are moderator roles:")
                    .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

                let list = "";
                for (const mod of mods) {
                    const role = event.guild.roles.cache.get(mod);
                    if (!role) {
                        await database.guilds.updateOne({ id: guild.id }, { "$pull": { "config.roles.moderator": mod } });
                    } else {
                        list += `${role.name}\n`;
                    }
                }

                embed.setDescription(list);
                event.send({ embed: embed });
                break;
            }

            case "detection": {
                await event.send(`${guild.config.duplicates?.detection === true ? "The duplicate detection is enabled." : "The duplicate detection is disabled."}`);
                break;
            }

            case "search": {
                if (!guild.config.duplicates?.search) {
                    event.send("There's no channel to search for deletions in.");
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.search": "" } });
                    return;
                }

                await event.send(`The channel to search in is <#${event.guild.channels.cache.get(guild.config.duplicates.search)}>`);
                break;
            }

            case "deletion": {
                if (!guild.config.duplicates?.log) {
                    event.send("There's no channel to log deleted messages in.");
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.log": "" } });
                    return;
                }

                await event.send(`The channel to log deleted messages in <#${event.guild.channels.cache.get(guild.config.duplicates.log)}>`);
                break;
            }

            case "time": {
                if (!guild.config.duplicates?.time) {
                    event.send("The time period hasn't been set.");
                    return;
                }

                await event.send(`The time period is set to ${formatDuration(new Date(Date.now() + guild.config.duplicates.time), true)}`);
                break;
            }

            case "leavechannel": {
                if (!guild.config.leaveLog?.channel) {
                    event.send("There's no channel post leave notifications in.");
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.leaveLog.channel": "" } });
                    return;
                }

                await event.send(`The channel to post leave notifications in is <#${event.guild.channels.cache.get(guild.config.leaveLog.channel)}>`);
                break;
            }

            case "member": {
                const id = guild.config.roles?.member;
                if (!id) {
                    event.send("There is no role set as the member role.");
                    return;
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.member": "" } });
                    await event.send("The role that used to be the member role was deleted or can't be found.");
                    return;
                }

                await event.send(`\`${role.name}\` is set as the member role.`);
                break;
            }

            case "unverified": {
                const id = guild.config.roles?.unverified;
                if (!id) {
                    event.send("There is no role set as the unverified role.");
                    return;
                }

                const role = event.guild.roles.cache.get(id);
                if (!role) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.unverified": "" } });
                    await event.send("The role that used to be the unverified role was deleted or can't be found.");
                    return;
                }

                await event.send(`\`${role.name}\` is set as the unverified role.`);
                break;
            }
        }
    }
    return;
}
