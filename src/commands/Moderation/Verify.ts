import Command from "../../command/Command";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";
import type { BotClient } from "../../BotClient";

export default class Verify extends Command {
    public constructor() {
        super("ping", "Check's the bot's responsiveness", undefined, PermissionFlagsBits.ModerateMembers);
        this.data.addUserOption(option =>
            option.setName("user")
                .setDescription("Member to be verified")
                .setRequired(true)
        )

        this.data.addStringOption(option =>
            option.setName("probation")
                .setDescription("Whether or not to apply probation role as well")
                .addChoices({ name: "Add", value: "add" })
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

        const user = interaction.options.getUser("user", true);
        if (!user) {
            interaction.reply({ content: "Couldn't find the user you're looking for.", ephemeral: true });
            return;
        }

        const member = await interaction.guild.members.fetch(user);
        if (!guild.config.roles?.verified) {
            interaction.reply({ content: "There is no configured verified role.", ephemeral: true });
            return;
        }

        const verified = await interaction.guild.roles.fetch(guild.config.roles.verified);
        if (!verified) {
            interaction.reply({ content: "Couldn't find the verified role.", ephemeral: true });
            return;
        }

        console.log(member);
    }
}
