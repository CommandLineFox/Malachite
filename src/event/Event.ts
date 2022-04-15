import type { BotClient } from "../BotClient";

export default abstract class Event {
    public readonly name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public abstract callback(client: BotClient, ...args: any[]): void;
}
