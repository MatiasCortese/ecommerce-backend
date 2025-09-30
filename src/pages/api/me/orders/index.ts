import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import getRawBody from "raw-body";
import { authMiddleware } from "@/lib/middlewares";
import { firestoreAdmin } from "@/lib/firestore";
const collection = firestoreAdmin.collection("orders");

type Data = {
  name: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
  decodedToken: any
) {
  await NextCors(req, res, {
    methods: ["GET", "OPTIONS"],
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
  if (req.method === 'GET') {
    const userId = decodedToken.userId;
    if(!userId){
      return res.status(400).json({ error: "User ID is required" });
    }
    const orders = await collection.where("userId", "==", userId).get();
    if(!orders || orders.empty) {
      return res.status(404).json({ error: "No orders found for this user"})
    }
    res.json({orders: orders.docs.map(doc => doc.data())});
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