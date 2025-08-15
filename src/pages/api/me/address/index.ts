import type { NextApiRequest, NextApiResponse } from "next";
import { authMiddleware } from "@/lib/middlewares";
import { User } from "@/lib/models/user";
type Data = {
  name: string;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
  decodedToken: any
) {
  if (req.method === 'PATCH') {
    try{
      const user = await User.findById(decodedToken.userId);
      if (!req.body.address) {
        return res.status(400).json({ error: "Address is required" });
      }
      await user.updateData({ address: req.body.address });
      res.json({ message: "Address updated successfully" });

    }
    catch (e) {
      res.status(400).json({ error: e });
    // Permite modificar un dato puntual del usuario al que pertenezca el token usado en el request. En este caso el objeto que describe la dirección.
    }
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