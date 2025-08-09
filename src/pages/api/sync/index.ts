import type { NextApiRequest, NextApiResponse } from "next";
// Update the import path if necessary, for example:
import { algoliaClient } from "@/lib/algolia";
import { getOffsetAndLimit } from "@/lib/requests";
import { airTableBase } from "@/lib/airtable";
const tableName = "Furniture";


export default function(req:NextApiRequest, res:NextApiResponse){
    const {offset, limit} = getOffsetAndLimit(req, 100, 100000);
    airTableBase(tableName)
        .select({
            pageSize: 11
        })
        .eachPage(
            async function(records, fetchNextPage){
                const objects = records.map((r) => {
                    return {
                        objectId: r.id,
                        ...r.fields
                    }
                })
                // seguir desde aca
                await algoliaClient.saveObjects({indexName: "products", objects})
                fetchNextPage()
                res.send("terminó");
            },
            function done(err){
                if(err){
                    console.log(err);
                    return;
                }
                console.log("terminó")
            }
        )
}