import { Collection, Db, MongoClient } from "mongodb";
import type { Guild } from "./models/Guild";
import type { Message } from "./models/Message";

interface DatabaseConfig {
    name: string;
    url: string;
}

export class Database {
    public db!: Db;

    public constructor(protected config: DatabaseConfig) { }

    public async connect(): Promise<void> {
        const client = new MongoClient(this.config.url);
        await client.connect()
            .catch(error => {
                throw error;
            });
        this.db = client.db(this.config.name);
        console.log("Connected to database");
    }

    public async getGuild(id: string): Promise<Guild | null> {
        let guild = await this.guilds.findOne({ id: id });
        if (!guild) {
            const newGuild = ({ id: id, config: {}, verifications: [] });
            await this.guilds.insertOne(newGuild);
            guild = await this.guilds.findOne({ id: id });
        }

        return guild;
    }

    public get guilds(): Collection<Guild> {
        return this.db.collection("guilds");
    }

    public get messages(): Collection<Message> {
        return this.db.collection("messages");
    }
}
