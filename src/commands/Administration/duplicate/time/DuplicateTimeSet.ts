import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";
import { formatDuration, getDuration } from "../../../../utils/Utils";

export default class DuplicateTimeSet extends Subcommand {
    public constructor() {
        super("set", "Set the time below which something is considered a duplicate");
        this.data.addStringOption(option =>
            option.setName("time")
                .setDescription("The time period")
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

        const option = interaction.options.getString("time", true);
        const time = getDuration(option);
        if (!time) {
            interaction.reply({ content: "You need to enter a valid amount of time.", ephemeral: true });
            return;
        }

        if (guild.config.duplicates?.time === time) {
            interaction.reply({ content: "The time period is already set to that.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.duplicates.time": time } });
        interaction.reply(`The time period has been set to ${formatDuration(new Date(Date.now() + time), true)}.`);
    }
}
