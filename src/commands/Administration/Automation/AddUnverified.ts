import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../BotClient";
import Subcommand from "../../../command/Subcommand";

export default class AddUnverified extends Subcommand {
    public constructor() {
        super("unverified", "Toggle automatically adding unverified role to users on join");
        this.data.addStringOption(option =>
            option.setName("toggle")
                .setDescription("Option")
                .addChoice("Enable", "enable")
                .addChoice("Disable", "disable")
                .setRequired(true)
        )
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

        const option = interaction.options.getString("toggle", true);
        switch (option.toLowerCase()) {
            case "enable": {
                if (guild.config.autoAddUnverified === true) {
                    interaction.reply({ content: "Automatically adding unverified role to newly joined members is already enabled.", ephemeral: true });
                    return;
                }

                await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.autoAddUnverified": true } });
                interaction.reply("Automatically adding unverified role to newly joined members has been enabled.");
                break;
            }

            case "disable": {
                if (guild.config.autoAddUnverified !== true) {
                    interaction.reply({ content: "Automatically adding unverified role to newly joined members is already disabled.", ephemeral: true });
                    return;
                }

                await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.autoAddUnverified": "" } });
                interaction.reply("Automatically adding unverified role to newly joined members has been disabled.");
                break;
            }
        }
    }
}
