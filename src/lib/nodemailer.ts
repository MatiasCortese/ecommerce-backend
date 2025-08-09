import nodemailer from "nodemailer";
import { env } from "process";  

async function enviarCorreoAlPayer(payerEmail: string, paymentId: string) {
    let transporter = nodemailer.createTransport({
       service: 'gmail',
         auth: {
            user: process.env.email,
            pass: process.env.password
         },
    })
    let info = await transporter.sendMail({
        from : '"Mi app" <matiascalisen@gmail.com',
        to: payerEmail,
        subject: `Pago recibido - ID: ${paymentId}`,
        text: `Hemos recibido tu pago con ID: ${paymentId}. Gracias por tu compra!`,
        html: `<b>Hemos recibido tu pago con ID: ${paymentId}. Gracias por tu compra!</b>`,
    })
}

async function enviarCorreoALaAdmin(data: any, paymentId: string) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password
        },
    })
    let info = await transporter.sendMail({
        from : '"Mi app ventas" <matiascalisen@gmail.com',
        to: "matiasemanuelcortese@gmail.com",
        subject: `Pago recibido - ID: ${paymentId}, ya podemos despachar el producto`,
        text: `Hemos recibido un pago con ID: ${paymentId} de ${data.name} (${data.email}). Coordinar con logística para envio!`,
        html: `<b>Hemos recibido un pago con ID: ${paymentId} de ${data.name} (${data.email}). Coordinar con logística para envio!</b>`,

})}

export {enviarCorreoAlPayer, enviarCorreoALaAdmin}