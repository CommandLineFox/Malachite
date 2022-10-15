import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../BotClient";
import Subcommand from "../../../command/Subcommand";

export default class ToggleVerifiedLogging extends Subcommand {
    public constructor() {
        super("toggle", "Toggle logging when verified role is added to users");
        this.data.addStringOption(option =>
            option.setName("toggle")
                .setDescription("Option")
                .addChoices({ name: "Enable", value: "enable" }, { name: "Disable", value: "disable" })
                .setRequired(true)
        )
    }

    async execute(interaction: CommandInteraction, client: BotClient): Promise<void> {
        if (!interaction.guild || !interaction.isChatInputCommand()) {
            return;
        }

        const guild = await client.database.getGuild(interaction.guild.id);
        if (!guild) {
            await interaction.reply({ content: "There was an error while trying to reach the database.", ephemeral: true });
            return;
        }

        const option = interaction.options.getString("toggle", true);
        switch (option.toLowerCase()) {
            case "enable": {
                if (guild.config.verifiedLog?.enabled === true) {
                    await interaction.reply({ content: "Logging when verified role is added to users is already enabled.", ephemeral: true });
                    return;
                }

                await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.verifiedLog.enabled": true } });
                await interaction.reply("Logging when verified role is added to userss has been enabled.");
                break;
            }

            case "disable": {
                if (guild.config.verifiedLog?.enabled !== true) {
                    await interaction.reply({ content: "Logging when verified role is added to users is already disabled.", ephemeral: true });
                    return;
                }

                await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.verifiedLog.enabled": "" } });
                await interaction.reply("Logging when verified role is added to users has been disabled.");
                break;
            }
        }
    }
}
