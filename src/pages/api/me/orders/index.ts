import type { NextApiRequest, NextApiResponse } from "next";
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