import type { NextApiRequest, NextApiResponse } from "next";
import { Payment, mpClient } from "@/lib/mercadopago";
import { firestoreAdmin } from "@/lib/firestore";
import {enviarCorreoALaAdmin, enviarCorreoAlPayer} from "@/lib/nodemailer";

type Data = {
  name: string;
};


//  seguir desde acá para validar recepcion del webhook y error
// SyntaxError: Unexpected token ''', "'{ "type":"... is not valid JSON
//     at JSON.parse (<anonymous>)
//     at 7923 (.next/server/pages/api/ipn/mercadopago.js:1:943)
//     at o (.next/server/webpack-api-runtime.js:1:189)
//     at 8295 (.next/server/pages/api/ipn/mercadopago.js:1:1241)
//     at o (.next/server/webpack-api-runtime.js:1:189)
//     at <unknown> (.next/server/pages/api/ipn/mercadopago.js:1:3260)
//     at Object.<anonymous> (.next/server/pages/api/ipn/mercadopago.js:1:3290)
//     at Module.<anonymous> (../../opt/rust/bytecode.js:2:1435)
//     at A.l._compile (../../opt/rust/bytecode.js:2:3160)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  if (req.method == "POST") {
    console.log("dentro del post de ipn mercadopago");
    // Recasibe la señal de MercadoPago para confirmar que el pago fué realizado con éxito.
    const body = req.body;
    console.log({"body de ipn mercadopago": body,
      "bodytype": typeof body,
    });
    if (body.action == "payment.created" || body.action == "payment.updated"){
      const paymentId = body.data.id;
      // Use the correct method to retrieve payment details; adjust as needed based on your Payment class implementation
      // 121660069870
      const paymentData = await new Payment(mpClient).get({id: paymentId});
      if (paymentData.status != "approved"){
        return res.status(400).json({error: "Payment not approved or in process"});
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
    res.status(200).json({message: "ok"});
    // enviarle mail al payer de que el pago se realizó correctamente acá se va a complicar porque en MP usamos test users como payer, entonces no vamos a poder enviarle un mail real.
    // const responseCorreoPayer = await enviarCorreoAlPayer(paymentData.payer?.email as any, paymentData.id as any);
    // const responseCorreoAdmin = await enviarCorreoALaAdmin(paymentData.payer, paymentData.id as any);
    // crear email para administracion interna informando pago aprobado y que se puede seguir con el despacho / proceso que corresponda
    } 
  }
  else {
    res.status(405).json({error: "Method Not Allowed"})
  }
}