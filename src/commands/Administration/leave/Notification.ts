import type { CommandInteraction } from "discord.js";
import type { BotClient } from "../../../BotClient";
import Subcommand from "../../../command/Subcommand";

export default class LeaveNotification extends Subcommand {
    public constructor() {
        super("notification", "Toggle sending leave messages");
        this.data.addStringOption(option =>
            option.setName("toggle")
                .setDescription("Option")
                .addChoices({ name: "Enable", value: "enable" }, { name: "Disable", value: "disable" })
                .setRequired(true)
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

        const option = interaction.options.getString("toggle", true);
        switch (option.toLowerCase()) {
            case "enable": {
                if (guild.config.leaveLog?.notification === true) {
                    await interaction.reply({ content: "Sending leave messages is already enabled.", ephemeral: true });
                    return;
                }

                await client.database.guilds.updateOne({ id: guild.id }, { "$set": { "config.leaveLog.notification": true } });
                await interaction.reply("Sending leave messages has been enabled.");
                break;
            }

            case "disable": {
                if (guild.config.leaveLog?.notification !== true) {
                    await interaction.reply({ content: "Sending leave messages is already disabled.", ephemeral: true });
                    return;
                }

                await client.database.guilds.updateOne({ id: guild.id }, { "$unset": { "config.leaveLog.notification": "" } });
                await interaction.reply("Sending leave messages has been disabled.");
                break;
            }
        }
    }
}
