import Command from "@command/Command";
import { Basic } from "~/Groups";
import CommandEvent from "@command/CommandEvent";
import { MessageEmbed } from "discord.js";
import CommandRegistry from "@command/CommandRegistry";

export default class Help extends Command {
    public constructor() {
        super({
            name: "Help",
            triggers: ["help", "commands", "cmds"],
            description: "Displays all my commands",
            group: Basic,
            botPermissions: ["EMBED_LINKS"]
        });
    }

    public async run(event: CommandEvent): Promise<void> {
        const client = event.client;
        try {
            const author = event.author;
            const member = event.member;
            const guild = event.guild;
            const mod = await client.isMod(member, guild);

            const help = new MessageEmbed()
                .setTitle("Here's the list of all my commands")
                .setColor("#61e096")
                .setFooter(`Requested by ${author.tag}`, author.displayAvatarURL());
            CommandRegistry.groups.forEach((group) => {
                if (group.ownerOnly && !client.isOwner(event.author)) {
                    return;
                } else if (group.adminOnly && !client.isAdmin(member)) {
                    return;
                } else if (group.modOnly && !mod) {
                    return;
                }

                const commands = group.commands.map((command) => `${command.name} (\`${command.triggers.join("`,`")}\`) -> ${command.description}`);
                if (commands.length === 0) {
                    return;
                }

                help.addField(group.name, commands.join("\n"));
            });

            event.send({ embed: help });
        } catch (error) {
            client.emit("error", error);
        }
    }
}
