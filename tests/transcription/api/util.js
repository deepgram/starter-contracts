import crypto from "node:crypto";

export const requestId = () => crypto.randomUUID();
