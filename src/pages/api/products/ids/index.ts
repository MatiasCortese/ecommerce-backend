import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import getRawBody from "raw-body";
import { algoliaClient } from "@/lib/algolia";

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
  if (req.method === "GET") {
    try {
      const ids: any[] = [];
      
      // Use search with empty query to get all products
      const response = await algoliaClient.search({
        requests: [
          {
            indexName: "products",
            params: "query=&attributesToRetrieve=objectID&hitsPerPage=1000" } ] });
      
      // Type assertion to handle the search result properly
      const searchResult = response.results[0] as any;
      if (searchResult.hits) {
        // Extract only the objectID from each hit
        const objectIds = searchResult.hits.map((hit: any) => hit.objectID);
        ids.push(...objectIds);
      }
      
      res.json({ ids });
    } catch (e) {
      console.error("Error fetching products from Algolia:", e);
      res.status(500).json({ error: "Error fetching products" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}