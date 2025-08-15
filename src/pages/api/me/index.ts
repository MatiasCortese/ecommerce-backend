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
  if (req.method === 'GET') {
    if(!req.headers.authorization){
      return res.status(401).json({ error: "Authorization header is required" });
    }
    const user = new User(decodedToken.userId);
    await user.pull();
    res.json({user});
    // Devuelve info del user asociado a ese token
  } 
  if (req.method === 'PATCH'){
    try {
      const user = await User.findById(decodedToken.userId);
      await user.updateData(req.body);
      res.json({message: "User updated successfully"});
    }
    // Permite modificar algunos datos del usuario al que pertenezca el token.
    catch (e) {
      res.status(400).json({ error: e });
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