import type { GatewayIntentBits, Partials } from "discord.js";
import { existsSync, readFileSync } from "fs";

export interface Config {
    token: string;
    id: string;
    guild: string;
    owners: string[];
    options: {
        disableMentions: "all" | "everyone" | "none";
        partials: Partials[];
        intents: GatewayIntentBits[];
    };
    database: {
        name: string;
        url: string
    }
}

export function getConfig(file: string): Config | null {
    if (!existsSync(file)) {
        console.log("Couldn't find the config file");
        return null;
    }

    return JSON.parse(readFileSync(file).toString());
}
