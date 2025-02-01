import { app } from "../app";
import { agent } from "supertest";

export const req = agent(app);