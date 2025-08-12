import Airtable from "airtable";

const apiKey = process.env.AIRTABLE_API_KEY as string;
const dbId = process.env.AIRTABLE_DB_ID as string;

const airTableBase = new Airtable({ apiKey }).base(dbId);

export {airTableBase};

