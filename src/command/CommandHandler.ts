import { existsSync, readdirSync, statSync } from "fs";
import type { BotClient } from "../BotClient";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import type Command from "./Command";
import type Subcommand from "./Subcommand";
import { SlashCommandSubcommandGroupBuilder } from "discord.js";

export default class CommandHandler {
    protected client: BotClient;

    public constructor(client: BotClient) {
        this.client = client;
        this.getCommands();
        this.reloadCommands();
    }

    getCommands(): void {
        if (!existsSync("./dist/commands")) {
            return;
        }

        const groups = readdirSync("./dist/commands");
        for (const group of groups) {
            const groupStat = statSync(`./dist/commands/${group}`);
            if (!groupStat || !groupStat.isDirectory()) {
                continue;
            }

            this.readGroup(group);
        }
    }

    readGroup(group: string) {
        const commands = readdirSync(`./dist/commands/${group}`);

        for (const command of commands) {
            const commandStat = statSync(`./dist/commands/${group}/${command}`);

            if (commandStat.isFile() && command.endsWith(".js")) {
                this.addCommand(`../commands/${group}/${command.slice(0, -3)}`);
                continue;
            }

            if (commandStat.isDirectory()) {
                const subcommands = readdirSync(`./dist/commands/${group}/${command}`);

                for (const subcommand of subcommands) {
                    this.readSubcommand(group, command, subcommand);
                }
            }
        }
    }

    readSubcommand(group: string, command: string, subcommand: string) {
        const subcommandStat = statSync(`./dist/commands/${group}/${command}/${subcommand}`);

        if (subcommandStat.isFile() && subcommand === "index.js") {
            this.addCommand(`../commands/${group}/${command}/${subcommand.slice(0, -3)}`);
            return;
        }

        if (subcommandStat.isFile() && subcommand.endsWith(".js")) {
            this.addSubcommand(`../commands/${group}/${command}/${subcommand.slice(0, -3)}`, command, `../commands/${group}/${command}`);
            return;
        }

        if (subcommandStat.isDirectory()) {
            const subcommandGroup = readdirSync(`./dist/commands/${group}/${command}/${subcommand}`);
            const subcommands = [] as Subcommand[];

            for (const subcommandGroupFile of subcommandGroup) {
                if (subcommandGroupFile.endsWith(".js")) {
                    subcommands.push(this.getSubcommand(`../commands/${group}/${command}/${subcommand}/${subcommandGroupFile.slice(0, -3)}`));
                }
            }

            this.addSubcommandGroup(subcommands, command, subcommand, `../commands/${group}/${command}`);
        }
    }

    reloadCommands(): void {
        const rest = new REST({ version: '10' }).setToken(this.client.config.token);

        (async () => {
            try {
                const commands = this.client.commands.map(command => command.data.toJSON());
                await rest.put(Routes.applicationGuildCommands(this.client.config.id, this.client.config.guild), { body: commands });
                console.log('Reloaded commands');
            } catch (error) {
                console.error(error);
            }
        })();
    }

    getCommand(path: string): Command {
        let commandImport;

        try {
            commandImport = require(path).default;
        } catch (error) {
            console.log(error);
        }

        return (new commandImport) as Command;
    }

    addCommand(path: string): void {
        const command = this.getCommand(path);
        if (this.client.commands.get(command.data.name)) {
            return;
        }

        this.client.commands.set(command.data.name, command);
    }

    findCommand(path: string, name: string): Command | undefined {
        let command = this.client.commands.get(name);
        if (!command) {
            this.addCommand(`${path}/index`);
            command = this.client.commands.get(name);
            if (!command) {
                return;
            }
        }

        return command;
    }

    getSubcommand(path: string): Subcommand {
        let subcommandImport;

        try {
            subcommandImport = require(path).default;
        } catch (error) {
            console.log(error);
        }

        return (new subcommandImport) as Subcommand;
    }

    addSubcommand(path: string, commandName: string, commandPath: string): void {
        const command = this.findCommand(commandPath, commandName);
        if (!command) {
            return;
        }

        const subcommand = this.getSubcommand(path);
        command.subcommands.set(commandName + " " + subcommand.data.name, subcommand);
        command.data.addSubcommand(subcommand.data);
    }

    addSubcommandGroup(subcommands: Subcommand[], commandName: string, groupName: string, commandPath: string): void {
        const command = this.findCommand(commandPath, commandName);
        if (!command) {
            return;
        }

        const subcommandGroup = new SlashCommandSubcommandGroupBuilder()
            .setName(groupName)
            .setDescription(`group: ${groupName}`);

        for (const subcommand of subcommands) {
            command.subcommands.set(commandName + " " + groupName + " " + subcommand.data.name, subcommand);
            subcommandGroup.addSubcommand(subcommand.data);
        }

        command.data.addSubcommandGroup(subcommandGroup);
    }
}
