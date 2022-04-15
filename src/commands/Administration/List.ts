import Command from "../../command/Command";
import { CommandInteraction, MessageEmbed } from "discord.js";
import type { BotClient } from "../../BotClient";
import { formatDuration } from "../../utils/Utils";
import type { Guild } from "../../models/Guild";

export default class Autiomation extends Command {
    public constructor() {
        super("list", "List all settings for current guild", [], ["ADMINISTRATOR"]);
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const guild = await client.database.getGuild(interaction.guild.id);
        if (!guild) {
            interaction.reply({ content: "There was an error while trying to reach the database.", ephemeral: true });
            return;
        }

        const embed = new MessageEmbed()
            .setTitle("The current settings for this server:")
            .addField("Duplicate detection", await displayData(interaction, client, guild,"detection"), true)
            .addField("Duplicate search", await displayData(interaction, client, guild,"search"), true)
            .addField("Deletion log", await displayData(interaction, client, guild, "deletion"), true)
            .addField("Time", await displayData(interaction, client, guild,"time"), true)
            .addField("Member role", await displayData(interaction, client, guild,"member"), true)
            .addField("Unverified role", await displayData(interaction, client, guild, "unverified"), true)
            .addField("Probation role", await displayData(interaction, client, guild, "probation"), true)
            .addField("Verified role", await displayData(interaction, client, guild, "verified"), true)
            .addField("Nsfw role", await displayData(interaction, client, guild, "nsfw"), true)
            .addField("Leave notifications", await displayData(interaction, client, guild, "leavenotification"), true)
            .addField("Leave channel", await displayData(interaction, client, guild, "leavechannel"), true)
            .addField("Leave message", await displayData(interaction, client, guild, "leavemessage"), true)
            .addField("Leave emote", await displayData(interaction, client, guild, "leaveemote"), true)
            .addField("Verification", await displayData(interaction, client, guild,"verification"), true)
            .addField("Verification channel", await displayData(interaction, client, guild, "verificationchannel"), true)
            .addField("Verification log", await displayData(interaction, client, guild, "verificationlog"), true)
            .addField("Welcome channel", await displayData(interaction, client, guild, "welcomechannel"), true)
            .addField("Welcome message", await displayData(interaction, client, guild, "welcomemessage"), true)
            .addField("Welcome notification", await displayData(interaction, client, guild, "welcomenotification"), true)
            .addField("Auto-remove NSFW", await displayData(interaction, client, guild,"autoremovensfw"), true)
            .addField("Auto-add unverified", await displayData(interaction, client, guild, "autoaddunverified"), true)
            .addField("Password", await displayData(interaction, client, guild, "password"), true)
        interaction.reply({ embeds: [embed] });
    }
}

async function displayData(interaction: CommandInteraction, client: BotClient, guild: Guild, type: string): Promise<any> {
    const database = client.database;
    switch (type.toLowerCase()) {
        case "detection": {
            return guild.config.duplicates?.detection === true ? "Enabled" : "Disabled";
        }

        case "search": {
            if (!guild.config.duplicates?.search) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.search": "" } });
                return "None";
            }

            return `${interaction.guild!.channels.cache.get(guild.config.duplicates.search)}`;
        }

        case "deletion": {
            if (!guild.config.duplicates?.log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.log": "" } });
                return "None";
            }

            return `${interaction.guild!.channels.cache.get(guild.config.duplicates.log)}`;
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

            return `${interaction.guild!.channels.cache.get(guild.config.leaveLog.channel)}`;
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

            const role = interaction.guild!.roles.cache.get(id);
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

            const role = interaction.guild!.roles.cache.get(id);
            if (!role) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.unverified": "" } });
                return "No unverified role";
            }

            return role.name;
        }

        case "probation": {
            if (!guild.config.roles) {
                return "Not set up";
            }

            const id = guild.config.roles.probation;
            if (!id) {
                return "No probation role";
            }

            const role = interaction.guild!.roles.cache.get(id);
            if (!role) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.probation": "" } });
                return "No probation role";
            }

            return role.name;
        }

        case "verified": {
            if (!guild.config.roles) {
                return "Not set up";
            }

            const id = guild.config.roles.verified;
            if (!id) {
                return "No verified role";
            }

            const role = interaction.guild!.roles.cache.get(id);
            if (!role) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.verified": "" } });
                return "No verified role";
            }

            return role.name;
        }

        case "nsfw": {
            if (!guild.config.roles) {
                return "Not set up";
            }

            const id = guild.config.roles.nsfw;
            if (!id) {
                return "No nsfw role";
            }

            const role = interaction.guild!.roles.cache.get(id);
            if (!role) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.nsfw": "" } });
                return "No nsfw role";
            }

            return role.name;
        }

        case "verification": {
            return guild.config.verification?.enabled === true ? "Enabled" : "Disabled";
        }

        case "verificationchannel": {
            if (!guild.config.verification?.channel) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.verification.channel": "" } });
                return "None";
            }

            return `${interaction.guild!.channels.cache.get(guild.config.verification.channel)}`;
        }

        case "verificationlog": {
            if (!guild.config.verification?.log) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.verification.log": "" } });
                return "None";
            }

            return `${interaction.guild!.channels.cache.get(guild.config.verification.log)}`;
        }

        case "welcomechannel": {
            if (!guild.config.welcome?.channel) {
                await database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.welcome.channel": "" } });
                return "None";
            }

            return `${interaction.guild!.channels.cache.get(guild.config.welcome.channel)}`;
        }

        case "welcomemessage": {
            if (!guild.config.welcome?.message) {
                return "None";
            }

            return guild.config.welcome.message;
        }

        case "welcomenotification": {
            return guild.config.welcome?.notification === true ? "Enabled" : "Disabled";
        }

        case "password": {
            if (!guild.config.verification?.password) {
                return "None";
            }

            return guild.config.verification.password;
        }

        case "autoremovensfw": {
            return guild.config.autoRemoveNsfw === true ? "Enabled" : "Disabled";
        }

        case "autoaddunverified": {
            return guild.config.autoAddUnverified === true ? "Enabled" : "Disabled";
        }
    }
}
