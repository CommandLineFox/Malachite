import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class VerifiedLogChannelRemove extends Subcommand {
    public constructor() {
        super("remove", "Remove the channel to when verified role is added to users");
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

        if (!guild.config.leaveLog?.channel) {
            interaction.reply({ content: "The channel to send leave messages in has not been set yet.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.verifiedLog.channel": "" } });
        interaction.reply("The channel to send leave messages in has been removed.");
    }
}
