import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class LeaveEmoteRemove extends Subcommand {
    public constructor() {
        super("remove", "Remove the emote that gets set as reaction to leave messages");
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

        if (!guild.config.leaveLog?.emote) {
            interaction.reply({ content: "The leave emote has not been set yet.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.leaveLog.emote": "" } });
        interaction.reply("The leave emote has been removed.");
    }
}
