import Event from "@event/Event";
import BotClient from "~/BotClient";

export default class Errors extends Event {
    public constructor() {
        super({ name: "error" });
    }

    public callback(_client: BotClient, error: Error): void {
        console.log(error);
    }
}
