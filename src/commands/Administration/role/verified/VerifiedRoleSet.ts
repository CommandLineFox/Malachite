import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../../BotClient";
import Subcommand from "../../../../command/Subcommand";

export default class VerifiedRoleSet extends Subcommand {
    public constructor() {
        super("set", "Set the verified role");
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
        if (guild.config.roles?.verified === role.id) {
            interaction.reply({ content: "The verified role is already set to that.", ephemeral: true });
            return;
        }

        await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.roles.verified": role.id } });
        interaction.reply(`The verified role has been set to **${role.name}**.`);
    }
}
