import type { NextApiRequest, NextApiResponse } from "next";
import { Payment, mpClient } from "@/lib/mercadopago";
import { firestoreAdmin } from "@/lib/firestore";
import {enviarCorreoALaAdmin, enviarCorreoAlPayer} from "@/lib/nodemailer";

type Data = {
  message: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  try {
    if (req.method === "POST") {
      console.log("dentro del post de ipn mercadopago");
      
      // Verificar que el body existe
      if (!req.body) {
        console.log("Body is missing");
        return res.status(400).json({ message: "Body is missing" });
      }

      let body;
      
      // Manejar tanto string como objeto
      if (typeof req.body === 'string') {
        try {
          body = JSON.parse(req.body);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.log('Raw body:', req.body);
          return res.status(400).json({ message: "Invalid JSON format" });
        }
      } else {
        body = req.body;
      }

      console.log({
        "body de ipn mercadopago": body,
        "bodytype": typeof body,
        "action": body.action,
        "data": body.data
      });

      // Verificar que es un evento de pago
      if (body.action === "payment.created" || body.action === "payment.updated") {
        const paymentId = body.data?.id;
        
        if (!paymentId) {
          console.log("Payment ID is missing");
          return res.status(400).json({ message: "Payment ID is missing" });
        }

        console.log("Getting payment data for ID:", paymentId);
        
        // Obtener datos del pago desde MercadoPago
        const paymentData = await new Payment(mpClient).get({id: paymentId});
        
        console.log("Payment status:", paymentData.status);
        console.log("External reference:", paymentData.external_reference);

        if (paymentData.status !== "approved") {
          console.log("Payment not approved, status:", paymentData.status);
          return res.status(200).json({ message: "Payment not approved yet, ignoring" });
        }

        // Buscar la orden en Firebase
        const orderEnDb = await firestoreAdmin.collection("orders")
          .where("external_reference", "==", paymentData.external_reference)
          .get();

        if (orderEnDb.empty) {
          console.log("Order not found for external_reference:", paymentData.external_reference);
          return res.status(404).json({ message: "Order not found" });
        }

        const orderDoc = orderEnDb.docs[0];
        console.log("Updating order:", orderDoc.id);

        // Actualizar el estado de la orden
        await firestoreAdmin.collection("orders").doc(orderDoc.id).update({
          status: paymentData.status,
          paymentIdMp: paymentData.id,
          payerEmail: paymentData.payer?.email,
          updatedAt: new Date(),
          external_reference: paymentData.external_reference,
        });

        console.log("Order updated successfully");

        // Opcional: Enviar emails
        // const responseCorreoPayer = await enviarCorreoAlPayer(paymentData.payer?.email as any, paymentData.id as any);
        // const responseCorreoAdmin = await enviarCorreoALaAdmin(paymentData.payer, paymentData.id as any);

        return res.status(200).json({ message: "Webhook processed successfully" });
        
      } else {
        console.log("Action not handled:", body.action);
        return res.status(200).json({ message: "Action not handled" });
      }
      
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? (error as any).message : undefined
    });
  }
}

// Habilitar el body parser para JSON
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};