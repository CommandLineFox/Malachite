import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class LeaveMessageRemove extends Subcommand {
    public constructor() {
        super("remove", "Remove the leave message");
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

        if (!guild.config.leaveLog?.message) {
            await interaction.reply({ content: "The leave message has not been set yet.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.leaveLog.message": "" } });
        await interaction.reply("The leave message has been removed.");
    }
}
