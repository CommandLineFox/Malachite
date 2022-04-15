import type { IntentsString, PartialTypes } from "discord.js";
import { existsSync, readFileSync } from "fs";

export interface Config {
    token: string;
    id: string;
    guild: string;
    owners: string[];
    options: {
        disableMentions: "all" | "everyone" | "none";
        partials: PartialTypes[];
        intents: IntentsString[];
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
