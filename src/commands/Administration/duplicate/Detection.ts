import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../BotClient";
import Subcommand from "../../../command/Subcommand";

export default class DuplicateDetection extends Subcommand {
    public constructor() {
        super("detection", "Toggle searching for duplicates");
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
            interaction.reply({ content: "There was an error while trying to reach the database.", ephemeral: true });
            return;
        }

        const option = interaction.options.getString("toggle", true);
        switch (option.toLowerCase()) {
            case "enable": {
                if (guild.config.duplicates?.detection === true) {
                    interaction.reply({ content: "Searching for duplicates is already enabled.", ephemeral: true });
                    return;
                }

                await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicates.detection": true } });
                interaction.reply("Searching for duplicates has been enabled.");
                break;
            }

            case "disable": {
                if (guild.config.duplicates?.detection !== true) {
                    interaction.reply({ content: "Searching for duplicates is already disabled.", ephemeral: true });
                    return;
                }

                await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.detection": "" } });
                interaction.reply("Searching for duplicates has been disabled.");
                break;
            }
        }
    }
}
