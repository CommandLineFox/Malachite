import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class ProbationRoleSet extends Subcommand {
    public constructor() {
        super("set", "Set the probation role");
        this.data.addRoleOption(option =>
            option.setName("role")
                .setDescription("Choose a role")
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

        const role = interaction.options.getRole("role", true);
        if (guild.config.roles?.probation === role.id) {
            interaction.reply({ content: "The probation role is already set to that.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.probation": role.id } });
        interaction.reply(`The probation role has been set to **${role.name}**.`);
    }
}
