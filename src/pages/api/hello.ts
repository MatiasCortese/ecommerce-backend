// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import getRawBody from "raw-body";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
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
  res.status(200).json({ name: "John Doe" });
}
