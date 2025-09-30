import type { NextApiRequest, NextApiResponse } from "next";
import { authMiddleware } from "@/lib/middlewares";
import NextCors from "nextjs-cors";
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
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  let body = req.body;
  if (!body || typeof body === "string" || Buffer.isBuffer(body)) {
    try {
      const raw = await require("raw-body")(req);
      body = JSON.parse(raw.toString("utf-8"));
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  if (req.method === 'PATCH') {
    try{
      const user = await User.findById(decodedToken.userId);
      if (!body.address) {
        return res.status(400).json({ error: "Address is required" });
      }
      await user.updateData({ address: body.address });
      res.json({ message: "Address updated successfully" });
    }
    catch (e) {
      res.status(400).json({ error: e });
    }
  }
  else {
    res.status(405).json({error: "Method Not Allowed"})
  }

}

export default authMiddleware(handler);
// Permite modificar un dato puntual del usuario al que pertenezca el token usado en el request. En este caso el objeto que describe la dirección.

export const config = {
  api: {
    api: {
      bodyParser: false,
    },
  },
};