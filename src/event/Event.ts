import BotClient from "~/BotClient";

interface EventOptions {
    readonly name: string;
    readonly disabled?: boolean;
}

export default abstract class Event implements EventOptions {
    public readonly name: string;
    public readonly disabled: boolean;

    public constructor(options: EventOptions) {
        this.name = options.name;
        this.disabled = options.disabled ?? false;
    }

    public abstract callback(client: BotClient, ...args: any[]): void;
}
