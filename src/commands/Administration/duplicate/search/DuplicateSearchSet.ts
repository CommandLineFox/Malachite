import { ChannelType, CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class DuplicateLogSet extends Subcommand {
    public constructor() {
        super("set", "Set the channel to search in for duplicates");
        this.data.addChannelOption(option =>
            option.setName("channel")
                .setDescription("Choose the channel for searching in")
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

        const channel = interaction.options.getChannel("channel", true);
        if (guild.config.duplicates?.search === channel.id) {
            await interaction.reply({ content: "The channel to search in for duplicates has already been set to the same channel.", ephemeral: true });
            return;
        }

        if (channel.type !== ChannelType.GuildText) {
            await interaction.reply({ content: "The channel to search in for duplicates can only be a text channel.", ephemeral: true })
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicates.search": channel.id } });
        await interaction.reply(`The channel to search in for duplicates has been set to <#${channel.id}>.`);
    }
}
