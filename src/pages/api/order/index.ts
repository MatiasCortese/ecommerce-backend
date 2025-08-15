import type { NextApiRequest, NextApiResponse } from "next";
import { firestoreAdmin } from "@/lib/firestore";
const collection = firestoreAdmin.collection("orders");
import {mpClient, Preference} from "@/lib/mercadopago";
import {authMiddleware} from "@/lib/middlewares";

type Data = {
  name: string;
};

// esto hay que abstraerlo. No puede tocar la DB y MP directo. Hay que crear un servicio que se encargue de la lógica de negocio y que use el cliente de MP y la DB.
async function handler (
  req: NextApiRequest,
  res: NextApiResponse<any>,
  decodedToken: any
) {
  try {
    if (req.method === 'POST') {
      // Verificar que el body existe
      if (!req.body) {
        return res.status(400).json({ error: "Request body is missing" });
      }

      let body;
      
      // Manejar tanto string como objeto
      if (typeof req.body === 'string') {
        try {
          body = JSON.parse(req.body);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          return res.status(400).json({ error: "Invalid JSON format" });
        }
      } else {
        body = req.body;
      }

      const userId = decodedToken.userId; 
      const { itemId, itemTitle, quantity, unitPrice, productId, external_reference } = body;
      
      if (!userId || !productId || !itemId || !itemTitle || !quantity || !unitPrice || !external_reference) {
        return res.status(400).json({ error: "Required parameters are missing" });
      }

      // crear compra en firebase
      const ordenCreada = await collection.add({
        userId, 
        productId, 
        itemId, 
        itemTitle, 
        quantity, 
        unitPrice, 
        status: "pending", 
        createdAt: new Date(), 
        external_reference
      });

      const preferenceClient = new Preference(mpClient);
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
      });

      return res.json({linkDePago: preferenceMp.init_point});
      // Genera una compra en nuestra base de datos y además genera una orden de pago en MercadoPago. Devuelve una URL de MercadoPago a donde vamos a redigirigir al user para que pague y el orderId.
      
    } else if (req.method === "GET") {
      const {orderId} = req.query;
      return res.status(200).json({ message: "Soy el get a order by id", orderId });
      // Devuelve una orden con toda la data incluyendo el estado de la orden.
    } else {
      return res.status(405).json({error: "Method Not Allowed"});
    }

  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
}

export default authMiddleware(handler);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};