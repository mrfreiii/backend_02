import { ObjectId } from "mongodb";

export type BlogType = {
    id?: string; // deprecated
    _id?: ObjectId; // new from mongodb
    name: string;
    description: string;
    websiteUrl: string;
    createdAt?: string;
    isMembership: boolean;
}

export type PostType = {
    id?: string; // deprecated
    _id?: ObjectId; // new from mongodb
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt?: string;
}
