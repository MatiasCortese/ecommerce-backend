import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import parseBearerToken from "parse-bearer-token";
import { decode } from "./jwt";

export function authMiddleware(callback:any){
    return async function(req: NextApiRequest, res: NextApiResponse) {
        await NextCors(req, res, {
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            origin: "*",
            optionsSuccessStatus: 200,
        });
        if (req.method === "OPTIONS") {
            res.status(200).json({});
            return;
        }
        const token = parseBearerToken(req);
        if (!token) {
            return res.status(401).json({ error: "Authorization header is required" });
        }
        const decodedToken = decode(token);
        if (!decodedToken) {
            return res.status(401).json({ error: "Invalid token" });
        }
        callback(req, res, decodedToken)
    }
}