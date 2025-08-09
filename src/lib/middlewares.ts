import { NextApiRequest, NextApiResponse } from "next";
import parseBearerToken from "parse-bearer-token";
import { decode } from "./jwt";

export function authMiddleware(callback:any){
    return function(req: NextApiRequest, res: NextApiResponse) {
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