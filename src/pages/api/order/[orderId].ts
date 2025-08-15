import type { NextApiRequest, NextApiResponse } from "next";
import { firestoreAdmin } from "@/lib/firestore";
const collection = firestoreAdmin.collection("orders");
import { authMiddleware } from "@/lib/middlewares";

type Data = {
  name: string;
};

// esto hay que abstraerlo. No puede tocar la DB y MP directo. Hay que crear un servicio que se encargue de la lógica de negocio y que use el cliente de MP y la DB.
async function handler (
  req: NextApiRequest,
  res: NextApiResponse<any>,
  decodedToken: any
) {
  if (req.method === "GET"){
    const {orderId} = req.query;
    const userId = decodedToken.userId;
    // lo que necesito aca es ir a la collection en firebase y que busque en las ordenes cuales son dle user id y las devuelva
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    } 
    const orderDoc = await collection.doc(orderId as string).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    const orderData = orderDoc.data();
    if (orderData?.userId !== userId) {
      return res.status(403).json({ error: "You do not have permission to access this order" });
    }
    res.status(200).json({ order: orderData });
  }
  else {
    res.status(405).json({error: "Method Not Allowed"})
  }
}

export default authMiddleware(handler);
