import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error("MP_ACCESS_TOKEN environment variable is not set");
}

const mpClient = new MercadoPagoConfig({
  accessToken
})

export { mpClient, Preference, Payment };