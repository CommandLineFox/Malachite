import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class NsfwRoleRemove extends Subcommand {
    public constructor() {
        super("remove", "Remove the NSFW role");
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

        if (!guild.config.roles?.nsfw) {
            await interaction.reply({ content: "The NSFW role has not been set yet.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.roles.nsfw": "" } });
        await interaction.reply(`The NSFW role has been removed.`);
    }
}
