import type { NextApiRequest, NextApiResponse } from "next";
// import { sendCodeToEmail } from "@/lib/controllers/auth-controller";
import { sendCodeToEmail } from "../../../lib/controllers/auth-controller";

type Data = {
  email: string;
};

// Recibe un email y encuentra/crea un user con ese email y le envía un código vía email. Le delegamos todo a sendCode que queda mas prolijo
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  console.log("SOY EL BODY ", req.body)
  if (req.method === 'POST') {
    if(!req.body.email){
      res.status(400).json({ email: "Only email needed" });
      return;
    }
    const { email, name, last_name, address, phone } = req.body;
    await sendCodeToEmail(email, name, last_name, address, phone);
    res.status(200).json({ message: "Email sended successfully"});
  } else {
    res.status(405).json({error: "Method Not Allowed"})
  }
}
