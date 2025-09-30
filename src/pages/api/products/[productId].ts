import { algoliaClient } from "@/lib/algolia";
import NextCors from "nextjs-cors";
import getRawBody from "raw-body";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  const { productId } = req.query;
  if (req.method === "GET") {
    try {
      // Busca el producto por objectID en Algolia
      const result = await algoliaClient.getObject({
        indexName: "products",
        objectID: productId as string,
      });
      if (!result) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ product: result });
    } catch (e) {
      // Si Algolia lanza un error porque no existe el objectID
      res.status(404).json({ error: "Product not found" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}


export const config = {
  api: {
    bodyParser: false,
  },
};