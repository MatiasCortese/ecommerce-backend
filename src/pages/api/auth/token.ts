import type { NextApiRequest, NextApiResponse } from "next";
import { createAuthToken } from "@/lib/controllers/auth-controller";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === 'POST') {
    if(!req.body.email || !req.body.code) {
      return res.status(400).json({ error: "Email and code are required" });
    }
    const { email, code } = req.body;
    const token = await createAuthToken(email, code);
    res.json({token})
    // Recibe un email y un código y valida que sean los correctos. En el caso de que sean correctos devuelve un token e invalida el código.
  } else {
    res.status(405).json({error: "Method Not Allowed"})
  }
  
}


