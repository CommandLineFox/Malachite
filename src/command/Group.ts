import Command from "@command/Command";
import CommandRegistry from "@command/CommandRegistry";

interface GroupOptions {
    readonly name: string;
    readonly description: string;
    readonly guildOnly?: boolean;
    readonly modOnly?: boolean;
    readonly adminOnly?: boolean;
    readonly ownerOnly?: boolean;
    readonly disabled?: boolean;
}

export default class Group implements GroupOptions {
    public readonly name: string;
    public readonly description: string;
    public readonly guildOnly: boolean;
    public readonly modOnly: boolean;
    public readonly adminOnly: boolean;
    public readonly ownerOnly: boolean;
    public readonly disabled: boolean;

    public constructor(options: GroupOptions) {
        this.name = options.name;
        this.description = options.description;
        this.guildOnly = options.guildOnly ?? false;
        this.modOnly = options.modOnly ?? false;
        this.adminOnly = options.adminOnly ?? false;
        this.ownerOnly = options.ownerOnly ?? false;
        this.disabled = options.disabled ?? false;
    }

    private _commands: readonly Command[] | undefined;

    public get commands(): readonly Command[] {
        return this._commands ?? (this._commands = CommandRegistry.getCommands(this));
    }
}
