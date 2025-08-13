import { Auth } from "@/lib/models/auth";
import {User} from "@/lib/models/user";
import gen from "random-seed";
import { addMinutes } from "date-fns";
import nodemailer from "nodemailer";
import {generate} from "@/lib/jwt";

var seed = Math.floor(100000 + Math.random() * 900000);
var random = gen.create((seed.toString()));

export async function findOrCreateAuth(data:any) {
    const cleanEmail = data.email.trim().toLowerCase();
    const auth = await Auth.findAuthByEmail(cleanEmail); 
    if (auth){
        return auth;
    } 
    else {
        const newUser = await User.createNewUser({
            email: cleanEmail,
            name: data.name || "",
            last_name: data.last_name || "",
            address: data.address || "",
            phone: data.phone || "",
        });
        const newAuth = await Auth.createNewAuth({
            email: cleanEmail,
            userId: newUser.id,
            code: "",
            expires: new Date()
        });
        return newAuth
    }
}

function manageNodemailerEmail(destinatario: any, code: any) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password 
        }
    });
    const mailOptions = {
        from: process.env.email,
        to: destinatario,
        subject: 'Código de Autenticación',
        text: `Tu código de verificación es: ${code}. Este código es válido por 20 minutos.`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
        } else {
            console.log('Correo enviado:',
             info.response);
             throw error;
        }
    });
}

export async function sendCodeToEmail(email: any, name: any, last_name: any, address: any, phone: any) {
        console.log("sendCodeToEmail INICIO", email);

    const auth = await Auth.findAuthByEmail(email);
    if (!auth) {
        throw new Error("Auth not found");
    }
    const code = random.intBetween(100000, 999999);
    const now = new Date();
    const twentyMinutesFromNow = addMinutes(now, 20);
    auth.data.code = code;
    auth.data.expires = twentyMinutesFromNow;
    await auth.push();
    console.log("Antes de enviar mail");
    manageNodemailerEmail(email, code);
    console.log("Mail enviado");
    return auth;
}


export async function createAuthToken(email: string, code: number) {
    // valida que el email y el código sean correctos
    const cleanEmail = email.trim().toLowerCase();
    if (!email || !code) {
        throw new Error("Email and code are required");
    }
    const auth = await Auth.getEmailAndCode(cleanEmail, code);
    if (!auth) {
        return "Invalid email or code";
    }
    // función que cree un nuevo codigo y la expiracion con nuevos datos
    const newCode = random.intBetween(100000, 999999);
    const now = new Date();
    const twentyMinutesFromNow = addMinutes(now, 20);
    auth.data.code = newCode;
    auth.data.expires = twentyMinutesFromNow;
    await auth.push();
    const jwt = await generate({userId: auth.data.userId});
    return jwt;
}