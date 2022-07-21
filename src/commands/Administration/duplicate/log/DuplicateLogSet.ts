import { ChannelType, CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class DuplicateLogSet extends Subcommand {
    public constructor() {
        super("set", "Set the channel for logging duplicates");
        this.data.addChannelOption(option =>
            option.setName("channel")
                .setDescription("Choose the channel for logging duplicates")
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

        const channel = interaction.options.getChannel("channel", true);
        if (guild.config.duplicates?.log === channel.id) {
            interaction.reply({ content: "The channel for logging duplicates has already been set to the same channel.", ephemeral: true });
            return;
        }

        if (channel.type !== ChannelType.GuildText) {
            interaction.reply({ content: "The channel for logging duplicates can only be a text channel.", ephemeral: true })
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicates.log": channel.id } });
        interaction.reply(`The channel for logging duplicates has been set to <#${channel.id}>.`);
    }
}
