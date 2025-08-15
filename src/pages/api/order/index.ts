import type { NextApiRequest, NextApiResponse } from "next";
import { firestoreAdmin } from "@/lib/firestore";
const collection = firestoreAdmin.collection("orders");
import {mpClient, Preference} from "@/lib/mercadopago";
import {authMiddleware} from "@/lib/middlewares";
import getRawBody from "raw-body";


type Data = {
  name: string;
};

// esto hay que abstraerlo. No puede tocar la DB y MP directo. Hay que crear un servicio que se encargue de la lógica de negocio y que use el cliente de MP y la DB.
async function handler (
  req: NextApiRequest,
  res: NextApiResponse<any>,
  decodedToken: any
) {
  if (req.method === 'POST') {
    let body;
    try {
      const raw = await getRawBody(req);
      body = JSON.parse(raw.toString("utf-8"));
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
    const userId = decodedToken.userId; 
    // acá mandar parámetros minimos que pide la preferencia de MP
    const { itemId, itemTitle, quantity, unitPrice, productId, external_reference } = body;
    if (!userId|| !productId || !itemId || !itemTitle || !quantity || !unitPrice || ! external_reference) {
      return res.status(400).json({ error: "Required parameters is/are missing" });
    }
    // crear compra en firebase? veamos como lo hice
    const ordenCreada = await collection.add({userId, productId, itemId, itemTitle, quantity, unitPrice, status: "pending", createdAt: new Date(), external_reference});
    const preferenceClient = await new Preference(mpClient);
    const preferenceMp = await preferenceClient.create({
      body: {
        items: [
          {
            title: itemTitle,
            unit_price: unitPrice,
            quantity: quantity,
            id: itemId,
          }
        ],
        external_reference: external_reference
      }
    })
    res.json({linkDePago: preferenceMp.init_point});
    // Genera una compra en nuestra base de datos y además genera una orden de pago en MercadoPago. Devuelve una URL de MercadoPago a donde vamos a redigirigir al user para que pague y el orderId.
    
  }
  if (req.method === "GET"){
    const {orderId} = req.query
    res.status(200).json({ message: "Soy el get a order by id", orderId });
    // Devuelve una orden con toda la data incluyendo el estado de la orden.
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