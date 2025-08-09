import Airtable from "airtable";

const apiKey = "patXOlOzjqqQ7vQXu.e6969d99ad4cf993da1f363642a4db4514afa4fd7f97f4248cb04b1de08cb714";
const dbId = "appwusjzyQhbjWAmd";
const airTableBase = new Airtable({apiKey: apiKey}).base(dbId);

export {airTableBase};

