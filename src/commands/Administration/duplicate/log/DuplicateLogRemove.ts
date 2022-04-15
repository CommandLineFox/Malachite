import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class DuplicateLogRemove extends Subcommand {
    public constructor() {
        super("remove", "Remove the channel for logging duplicates");
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

        if (!guild.config.duplicates?.log) {
            interaction.reply({ content: "The channel for logging duplicates has not been set yet.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.duplicates.log": "" } });
        interaction.reply("The channel for logging duplicates has been removed.");
    }
}
