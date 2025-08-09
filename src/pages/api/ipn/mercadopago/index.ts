import type { NextApiRequest, NextApiResponse } from "next";
import { Payment, mpClient } from "@/lib/mercadopago";
import { firestoreAdmin } from "@/lib/firestore";
import {enviarCorreoALaAdmin, enviarCorreoAlPayer} from "@/lib/nodemailer";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method === 'POST') {
    // Recasibe la señal de MercadoPago para confirmar que el pago fué realizado con éxito.
    const body = req.body;
    if(body.action == "payment.updated"){
      const paymentId = body.data.id;
      // Use the correct method to retrieve payment details; adjust as needed based on your Payment class implementation
      // 121660069870
      const paymentData = await new Payment(mpClient).get({id: paymentId});
      if(paymentData.status != "approved"){
        return res.status(400).json({error: "Payment not approved"});
      }
      // buscar el pago en nuestra db de firebase y cambiar el status a approved
      //  Cambia el estado de la compra en nuestra base 
      const orderEnDb = await firestoreAdmin.collection("orders")
        .where("external_reference", "==", paymentData.external_reference)
        .get();
      if(orderEnDb.empty){
        return res.status(404).json({error: "Order not found"});
      }
      const orderDoc = orderEnDb.docs[0];
      await firestoreAdmin.collection("orders").doc(orderDoc.id).update({
        status: paymentData.status,
        paymentIdMp: paymentData.id,
        payerEmail: paymentData.payer?.email,
    })
    // enviarle mail al payer de que el pago se realizó correctamente acá se va a complicar porque en MP usamos test users como payer, entonces no vamos a poder enviarle un mail real.
    const responseCorreoPayer = await enviarCorreoAlPayer(paymentData.payer?.email as any, paymentData.id as any);
    const responseCorreoAdmin = await enviarCorreoALaAdmin(paymentData.payer, paymentData.id as any);
    // crear email para administracion interna informando pago aprobado y que se puede seguir con el despacho / proceso que corresponda



  } else {
    res.status(405).json({error: "Method Not Allowed"})
  }
}
}