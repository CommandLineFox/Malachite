import Command from "../../command/Command";
import { CommandInteraction, PermissionFlagsBits } from "discord.js";
import type { BotClient } from "../../BotClient";

export default class Verify extends Command {
    public constructor() {
        super("verify", "CVerifies a provided user", undefined, PermissionFlagsBits.ModerateMembers);
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
            await interaction.reply({ content: "There was an error while trying to reach the database.", ephemeral: true });
            return;
        }

        const user = interaction.options.getUser("user", true);
        if (!user) {
            await interaction.reply({ content: "Couldn't find the user you're looking for.", ephemeral: true });
            return;
        }

        const member = await interaction.guild.members.fetch(user);
        if (!guild.config.roles?.verified) {
            await interaction.reply({ content: "There is no configured verified role.", ephemeral: true });
            return;
        }

        const verified = await interaction.guild.roles.fetch(guild.config.roles.verified);
        if (!verified) {
            await interaction.reply({ content: "Couldn't find the verified role.", ephemeral: true });
            return;
        }

        await member.roles.add(verified, `${interaction.member?.user.id}`);

        const prob = interaction.options.getString("probation");
        if (!prob) {
            await interaction.reply(`Successfully gave ${verified.name} to ${user.tag}`);
            return;
        }

        const probation = guild.config.roles.probation;
        if (!probation) {
            await interaction.reply({ content: "There is no configured probation role.", ephemeral: true });
            return;
        }

        const probationRole = await interaction.guild.roles.fetch(probation);
        if (!probationRole) {
            await interaction.reply({ content: "Couldn't find the probation role.", ephemeral: true });
            return;
        }

        await member.roles.add(probationRole, `${interaction.member?.user.id}`);
        await interaction.reply(`Successfully gave ${verified.name} and ${probationRole.name} to ${user.tag}`);
    }
}
