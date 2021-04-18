import Command from "@command/Command";
import { OwnerOnly } from "~/Groups";
import CommandEvent from "@command/CommandEvent";

export default class LogOff extends Command {
    public constructor() {
        super({
            name: "LogOff",
            triggers: ["logoff", "shutdown"],
            description: "Turns the bot off",
            group: OwnerOnly
        });
    }

    public async run(event: CommandEvent): Promise<void> {
        await event.message.delete();
        event.client.destroy();
    }
}
