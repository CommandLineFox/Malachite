import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class LeaveChannelSet extends Subcommand {
    public constructor() {
        super("set", "Set the emote that gets set as reaction to leave messages");
        this.data.addStringOption(option =>
            option.setName("emote")
                .setDescription("The leave emote")
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

        const option = interaction.options.getString("emote", true);
        if (guild.config.leaveLog?.emote === option) {
            interaction.reply({ content: "The leave emote is already set to that.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.leaveLog.emote": option } });
        interaction.reply(`The channel to send leave emote in has been set to:\n<#${option}>.`);
    }
}
