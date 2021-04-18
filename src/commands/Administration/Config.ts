import Command from "@command/Command";
import { Administration } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { Guild } from "@models/Guild";
import { MessageEmbed } from "discord.js";
import { splitArguments } from "@utils/Utils";
import { Database } from "~/database/Database";
import { DatabaseCheckOption, DisplayData } from "~/utils/Types";

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
    await databaseCheck(database, guild, "moderator");

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
            if (guild.config.duplicateDetection === true) {
                event.send("Detection is already enabled.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicateDetection": true } });
            await event.send("Successfully enabled detection of duplicates.");
            break;
        }

        case "disable": {
            if (guild.config.duplicateDetection !== true) {
                event.send("Detection is already disabled.");
                return;
            }

            database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicateDetection": "" } });
            await event.send("Successfully disabled detection of duplicates.");
            break;
        }
    }
}

async function duplicateSearchSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;
    await databaseCheck(database, guild, "channels");

    if (!option) {
        await displayData(event, guild, "prefix", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const channel = event.guild.channels.cache.find(channel => channel.name === args || channel.id === args || `<#${channel.id}>` === args);
            if (!channel) {
                event.send("Couldn't find the channel you're looking for.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels.duplicateSearch": channel.id } });
            await event.send(`The channel to search for duplicate messages in has been set to \`${channel.name}\`.`);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateSearch": "" } });
            await event.send("The channel to search for duplicate messages in has been removed.");
            break;
        }
    }
}

async function duplicateLogSettings(event: CommandEvent, option: string, args: string, guild: Guild) {
    const client = event.client;
    const database = client.database;
    await databaseCheck(database, guild, "channels");

    if (!option) {
        await displayData(event, guild, "prefix", true);
        return;
    }

    switch (option.toLowerCase()) {
        case "set": {
            const channel = event.guild.channels.cache.find(channel => channel.name === args || channel.id === args || `<#${channel.id}>` === args);
            if (!channel) {
                event.send("Couldn't find the channel you're looking for.");
                return;
            }

            await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels.duplicateLog": channel.id } });
            await event.send(`The channel to log deleted messages in has been set to \`${channel.name}\`.`);
            break;
        }

        case "remove": {
            await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateLog": "" } });
            await event.send("The channel to log deleted messages in has been removed.");
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
        .setFooter(`Requested by ${event.author.tag}`, event.author.displayAvatarURL());

    event.send({ embed: embed });
}

async function databaseCheck(database: Database, guild: Guild, option: DatabaseCheckOption): Promise<void> {
    switch (option.toLowerCase()) {
        case "roles": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": {} } });
            }
            break;
        }

        case "moderator": {
            if (!guild.config.roles) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles": { "moderator": [] } } });
            } else if (!guild.config.roles?.moderator) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.moderator": [] } });
            }
            break;
        }

        case "channels": {
            if (!guild.config.channels) {
                await database.guilds.updateOne({ id: guild.id }, { "$set": { "config.channels": {} } });
            }
            break;
        }
    }
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
                return guild.config.duplicateDetection === true ? "Enabled" : "Disabled";
            }

            case "search": {
                if (!guild.config.channels?.duplicateSearch) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateSearch": "" } });
                    return "None";
                }

                return `${event.guild.channels.cache.get(guild.config.channels.duplicateSearch)}`;
            }

            case "deletion": {
                if (!guild.config.channels?.duplicateLog) {
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateLog": "" } });
                    return "None";
                }

                return `${event.guild.channels.cache.get(guild.config.channels.duplicateLog)}`;
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
                await event.send(`${guild.config.duplicateDetection === true ? "The duplicate detection is enabled." : "The duplicate detection is disabled."}`);
                break;
            }

            case "search": {
                if (!guild.config.channels?.duplicateSearch) {
                    event.send("There's no channel to search for deletions in.");
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateSearch": "" } });
                    return;
                }

                await event.send(`The channel to search in is <#${event.guild.channels.cache.get(guild.config.channels.duplicateSearch)}>`);
                break;
            }

            case "deletion": {
                if (!guild.config.channels?.duplicateLog) {
                    event.send("There's no channel to log deleted messages in.");
                    await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.channels.duplicateLog": "" } });
                    return;
                }

                await event.send(`The channel to log deleted messages in <#${event.guild.channels.cache.get(guild.config.channels.duplicateLog)}>`);
                break;
            }
        }
    }
    return;
}
