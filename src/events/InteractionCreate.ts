import { ButtonInteraction, CommandInteraction, Interaction, MessageActionRow, MessageButton } from "discord.js";
import type { BotClient } from "../BotClient";
import type Command from "../command/Command";
import Event from "../event/Event";
import { formatUser } from "../utils/Utils"
import moment from "moment"

export default class Ready extends Event {
    public constructor() {
        super("interactionCreate");
    }

    public async callback(client: BotClient, interaction: Interaction): Promise<void> {
        if (interaction.isCommand()) {
            return handleCommandInteraction(client, interaction);
        }
        else if (interaction.isButton()) {
            return handleButtonInteraction(client, interaction);
        }
    }
}

async function handleCommandInteraction(client: BotClient, interaction: CommandInteraction): Promise<void> {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
        return;
    }

    if (!hasUserPermission(command, interaction)) {
        interaction.reply({ content: "You're not allowed to execute this command", ephemeral: true });
        return;
    }
    if (!hasBotPermission(command, interaction)) {
        interaction.reply({ content: "I'm not allowed to execute this command", ephemeral: true });
    }
    try {
        command.execute(interaction, client);
    } catch (error) {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
}

async function handleButtonInteraction(client: BotClient, interaction: ButtonInteraction) {
    const user = interaction.user;
    const message = await interaction.channel?.messages.fetch(interaction.message.id);
    if (!message) {
        return;
    }
    const server = interaction.guild;
    if (!server || user.bot) {
        return;
    }


    const dbGuild = await client.database.getGuild(server.id);
    if (!dbGuild?.config.verification?.log || interaction.channel?.id !== dbGuild.config.verification.log) {
        return;
    }

    const verification = dbGuild.verifications.find(verif => verif.message === message.id);
    if (!verification) {
        return;
    }

    const duration = moment(message.createdAt).fromNow(true);

    interaction.deferUpdate();
    if (interaction.customId.match(/.*-approve/)) {
        if (interaction.customId.match(/.*-approve-probation$/) && dbGuild.config.roles?.probation) {
            const probationRole = server.roles.cache.get(dbGuild.config.roles?.probation);
            if (probationRole) {
                const member = server.members.cache.get(verification.user);
                if (member) {
                    await member.roles.remove(probationRole);
                }
            }
        }
        if (dbGuild.config.roles?.unverified) {
            const unverifiedRole = server.roles.cache.get(dbGuild.config.roles.unverified);
            if (unverifiedRole) {
                const member = server.members.cache.get(verification.user);
                if (member) {
                    await member.roles.remove(unverifiedRole);
                }
            }
        }

        if (dbGuild.config.roles?.member) {
            const memberRole = server.roles.cache.get(dbGuild.config.roles.member);
            if (memberRole) {
                const member = server.members.cache.get(verification.user);
                if (member) {
                    await member.roles.add(memberRole);
                    await message.edit({
                        content: `✅ ${formatUser(member.user)} has been verified by ${user.tag} after ${duration}`,
                        components: []
                    });
                    await client.database.guilds.updateOne({ id: dbGuild.id }, { "$pull": { "verifications": verification } });
                }
            }
        } else {
            message.channel.send("Couldn't find the member role, please add it via config with \`/config member set <role>\`.")
                .then(msg => setTimeout(async () => msg.delete(), 10000));
        }
    } else if (interaction.customId.match(/.*-probation$/)) {
        if (dbGuild.config.roles?.probation) {
            const probationRole = server.roles.cache.get(dbGuild.config.roles.probation);
            if (probationRole) {
                const member = server.members.cache.get(verification.user);
                if (member) {
                    await member.roles.add(probationRole);
                    await message.edit({
                        content: `❗ ${formatUser(member.user)} has been put on probation by ${user.tag} after ${duration}`,
                        components: [ new MessageActionRow().addComponents(
                            new MessageButton()
                                .setCustomId(`${message.author.id}-approve-probation`)
                                .setLabel("Approve")
                                .setStyle('SUCCESS'),
                            new MessageButton()
                                .setCustomId(`${message.author.id}-kick`)
                                .setLabel("Kick")
                                .setStyle('DANGER'),
                            new MessageButton()
                                .setCustomId(`${message.author.id}-ban`)
                                .setLabel("Ban")
                                .setStyle('DANGER'),
                        ) ]
                    });
                }
            }
        } else {
            message.channel.send(`Couldn't find the probation role, please add it via config with /config probation set <role>\`.`)
                .then((msg) => {
                    setTimeout(async () => msg.delete(), 10000);
                });
        }
    } else if (interaction.customId.match(/.*-kick$/)) {
        const member = server.members.cache.get(verification.user);
        if (member) {
            if (member.kickable) {
                const format = formatUser(member.user);
                member.kick("Verification");
                message.edit({
                    content: `❌ ${format} has been kicked by ${user.tag} after ${duration}`,
                    components: []
                });
                client.database.guilds.updateOne({ id: dbGuild.id }, { "$pull": { "verifications": verification } });
            } else {
                message.channel.send("Couldn't kick the user. Please make sure my role has the right permissions and is above the user's highest role.")
                    .then((msg) => {
                        setTimeout(async () => msg.delete(), 10000);
                    });
            }
        }
    } else if (interaction.customId.match(/.*-ban$/)) {
        const member = server.members.cache.get(verification.user);
        if (member) {
            if (member.bannable) {
                const format = formatUser(member.user);
                member.ban({ reason: "Verification" });
                message.edit({
                    content: `🔞 ${format} has been banned by ${user.tag} after ${duration}`,
                    components: []
                });
                client.database.guilds.updateOne({ id: dbGuild.id }, { "$pull": { "verifications": verification } });
            } else {
                message.channel.send("Couldn't ban the user. Please make sure my role has the right permissions and is above the user's highest role.")
                    .then((msg) => {
                        setTimeout(async () => msg.delete(), 10000);
                    });
            }
        }
    }
}

function hasUserPermission(command: Command, interaction: Interaction): boolean {
    if (interaction.memberPermissions && command.userPermissions) {
        return interaction.memberPermissions.has(command.userPermissions);
    }

    return false;
}

function hasBotPermission(command: Command, interaction: Interaction): boolean {
    if (interaction.guild?.me?.permissions && command.botPermissions) {
        return interaction.guild.me.permissions.has(command.botPermissions);
    }

    return false;
}
