import type { NextApiRequest, NextApiResponse } from "next";

export function getOffsetAndLimit(req:NextApiRequest, maxLimit:number, maxOffset:number){
    // cuantos resultados quiero = limit
    const queryLimit = parseInt(req.query.limit as string);
    // desde donde los quiero = offset
    const queryOffset = parseInt(req.query.offset as string);
    const limit = queryLimit <= maxLimit ? queryLimit : maxLimit;
    const offset = queryOffset < maxOffset ? queryOffset : 0;
    return {
        limit,
        offset
    }
}