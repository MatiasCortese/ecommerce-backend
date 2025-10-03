import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import getRawBody from "raw-body";
import { authMiddleware } from "@/lib/middlewares";
import { User } from "@/lib/models/user";

type Data = {
  name: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
  decodedToken: any
) {
  await NextCors(req, res, {
    methods: ["GET", "PATCH", "OPTIONS"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  console.log("[DEBUG] Content-Type:", req.headers["content-type"]);
  let body = req.body;
  if (req.method === 'PATCH') {
    if (!body || typeof body === "string" || Buffer.isBuffer(body)) {
      try {
        const raw = await getRawBody(req);
        const rawString = raw.toString("utf-8");
        console.log("[DEBUG] Raw body string:", rawString);
        body = JSON.parse(rawString);
        console.log("[DEBUG] Parsed body:", body);
      } catch (e) {
        console.log("[ERROR] JSON parse error:", e);
        return res.status(400).json({ error: "Invalid JSON", details: String(e) });
      }
    } else {
      console.log("[DEBUG] Direct body:", body);
    }
  }
  if (req.method === 'OPTIONS') {
    // El middleware de CORS ya maneja la respuesta y los headers
    res.status(200).json({});
    return;
  }
  if (req.method === 'GET') {
    if(!req.headers.authorization){
      return res.status(401).json({ error: "Authorization header is required" });
    }
    const user = new User(decodedToken.userId);
    await user.pull();
    res.json({user});
    // Devuelve info del user asociado a ese token
  } 
  if (req.method === 'PATCH'){
    try {
      const user = await User.findById(decodedToken.userId);
      await user.updateData(body);
      res.json({message: "User updated successfully"});
    }
    // Permite modificar algunos datos del usuario al que pertenezca el token.
    catch (e) {
      res.status(400).json({ error: e });
    }
  }
  else {
    res.status(405).json({error: "Method Not Allowed"})
  }
}

export default authMiddleware(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};