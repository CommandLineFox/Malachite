import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class WelcomeMessageSet extends Subcommand {
    public constructor() {
        super("set", "Set the leave message, use {member} for mentioning the user and {server} for the server itself");
        this.data.addStringOption(option =>
            option.setName("message")
                .setDescription("The leave message")
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

        const option = interaction.options.getString("message", true);
        if (guild.config.welcome?.message === option) {
            await interaction.reply({ content: "The welcome message is already set to that.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.welcome.message": option } });
        await interaction.reply(`The channel to send welcome messages in has been set to:\n<#${option}>.`);
    }
}
