import type { NextApiRequest, NextApiResponse } from "next";    
import NextCors from "nextjs-cors";
import getRawBody from "raw-body";
import { algoliaClient } from "@/lib/algolia";  

type Product = {
  objectID: string;
  name: string;
  stock: number;
  [key: string]: any; // Permite cualquier otro campo adicional
};

const MIN_STOCK = 1;
// Buscar productos en nuestra base de datos Algolia. Chequea stock y todo lo necesario.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  await NextCors(req, res, {
    methods: ["GET", "OPTIONS"],
    origin: "*",
    optionsSuccessStatus: 200,
  });
  let body = req.body;
  if (!body || typeof body === "string" || Buffer.isBuffer(body)) {
    try {
      const raw = await getRawBody(req);
      body = JSON.parse(raw.toString("utf-8"));
    } catch (e) {
      body = {};
    }
  }
  if (req.method === 'GET') {
    const { q } = req.query;
    if(!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Query parameter 'q' is required and must be a string" });
    }
    try {
      const results = await algoliaClient.search({
        requests: [
          {
            indexName: "products",
            query: q,
            // aca tambien filtar por si la propiedad "In stock" de un hit es true
      

          }
      ]})
      res.json({products: results});
    }
    catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};