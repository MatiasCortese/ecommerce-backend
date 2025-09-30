import type { NextApiRequest, NextApiResponse } from "next";
import { createAuthToken } from "@/lib/controllers/auth-controller";
import NextCors from "nextjs-cors";
import getRawBody from "raw-body";
type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  await NextCors(req, res, {
    methods: ["POST", "GET", "OPTIONS"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  let body = req.body;
    if (!body || typeof body === "string" || Buffer.isBuffer(body)) {
    try {
      const raw = await getRawBody(req);
      body = JSON.parse(raw.toString("utf-8"));
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  if (req.method === 'POST') {
    if(!body.email || !body.code) {
      return res.status(400).json({ error: "Email and code are required" });
    }
    const { email, code } = body;
    const token = await createAuthToken(email, code);
    res.json({token})
    // Recibe un email y un código y valida que sean los correctos. En el caso de que sean correctos devuelve un token e invalida el código.
  } else {
    res.status(405).json({error: "Method Not Allowed"})
  }
}


export const config = {
  api: {
    bodyParser: false,
  },
};