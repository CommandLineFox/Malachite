import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class VerificationPasswordSet extends Subcommand {
    public constructor() {
        super("set", "Set the password");
        this.data.addStringOption(option =>
            option.setName("password")
                .setDescription("The password")
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

        const option = interaction.options.getString("emote", true).toLowerCase();
        if (guild.config.verification?.password === option) {
            interaction.reply({ content: "The leave emote is already set to that.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.verification.password": option } });
        interaction.reply(`The channel to send leave emote in has been set to:\n<#${option}>.`);
    }
}
