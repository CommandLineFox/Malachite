import { ObjectId } from "bson";

export interface Message {
    _id: ObjectId;
    user: string;
    guild: string;
    content: string;
    creation: number;
}
