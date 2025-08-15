import type { NextApiRequest, NextApiResponse } from "next";

// Paso 2: Agregamos Firebase
import {authMiddleware} from "@/lib/middlewares";
import { firestoreAdmin } from "@/lib/firestore";
const collection = firestoreAdmin.collection("orders");

// Mantenemos comentado MercadoPago por ahora
// import {mpClient, Preference} from "@/lib/mercadopago";

type Data = {
  message: string;
  debug?: any;
};

async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>,
  decodedToken: any // Agregamos el parámetro del token
) {
  console.log('=== HANDLER START ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    if (req.method === 'POST') {
      console.log('=== POST REQUEST ===');
      console.log('DecodedToken:', decodedToken);
      console.log('Firebase collection available:', !!collection); // Test Firebase
      console.log('Body type:', typeof req.body);
      console.log('Body:', req.body);
      console.log('Query:', req.query);
      
      // Test básico sin usar las librerías externas
      return res.status(200).json({
        message: "POST request received successfully",
        debug: {
          method: req.method,
          bodyType: typeof req.body,
          body: req.body,
          headers: req.headers,
          timestamp: new Date().toISOString()
        }
      });

    } else if (req.method === "GET") {
      console.log('=== GET REQUEST ===');
      const { orderId } = req.query;
      console.log('OrderId:', orderId);
      
      return res.status(200).json({ 
        message: "GET request received successfully",
        debug: {
          method: req.method,
          orderId,
          query: req.query,
          timestamp: new Date().toISOString()
        }
      });

    } else {
      console.log('=== UNSUPPORTED METHOD ===');
      console.log('Method received:', req.method);
      return res.status(405).json({ 
        message: "Method Not Allowed",
        debug: {
          method: req.method,
          allowedMethods: ['GET', 'POST']
        }
      });
    }

  } catch (error) {
    console.error('=== HANDLER ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', (error as any).message);
    console.error('Error stack:', (error as any).stack);
    
    return res.status(500).json({ 
      message: "Internal server error",
      debug: {
        error: (error as any).message,
        stack: process.env.NODE_ENV === 'development' ? (error as any).stack : undefined
      }
    });
  }
}

// Ahora probamos CON el authMiddleware
export default authMiddleware(handler);

// También probamos sin configuración especial del body
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};