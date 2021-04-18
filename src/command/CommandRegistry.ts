import Command from "@command/Command";
import Group from "@command/Group";
import { readdirSync, statSync } from "fs";

class CommandRegistry {
    public readonly commands: readonly Command[];
    public readonly groups: readonly Group[];

    public getCommands(group: Group): readonly Command[] {
        return this.commands.filter((command) => command.group === group);
    }

    public getCommand(trigger: string): Command | undefined {
        return this.commands.find((command) => command.triggers.includes(trigger.toLowerCase()));
    }

    public constructor() {
        this.commands = this.loadCommands();
        this.groups = this.loadGroups();
    }

    private loadCommands(): Command[] {
        const commands = [];
        const groups = readdirSync("./dist/commands");
        for (const group of groups) {
            const folder = statSync(`./dist/commands/${group}`);
            if (!folder) {
                continue;
            }

            const files = readdirSync(`./dist/commands/${group}`);
            for (const file of files) {
                if (!file.endsWith(".js")) {
                    continue;
                }

                const path = `../commands/${group}/${file.slice(0, -3)}`;
                let command;

                try {
                    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
                    command = require(path).default;
                    delete require.cache[require.resolve(path)];

                } catch (error) {
                    console.log(error);
                }

                commands.push(new command);
            }
        }

        return commands;
    }

    private loadGroups() {
        return this.commands.map((command) => command.group).filter((group, index, self) => self.indexOf(group) === index);
    }
}

export default new CommandRegistry();
