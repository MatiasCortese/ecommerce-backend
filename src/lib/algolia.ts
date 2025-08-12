import { algoliasearch } from 'algoliasearch';
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID as string;
const ALGOLIA_APP_KEY = process.env.ALGOLIA_APP_KEY as string;
if (!ALGOLIA_APP_ID || !ALGOLIA_APP_KEY) {
  throw new Error("ALGOLIA_APP_ID and ALGOLIA_APP_KEY environment variables must be set"); 
} 
const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_APP_KEY);

export {algoliaClient}