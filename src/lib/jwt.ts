import  jwt from "jsonwebtoken";

export function generate(obj: any){
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    return jwt.sign(obj, secret);
}

export function decode(token: any){
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET environment variable is not defined");
    }
    try{
        var decoded = jwt.verify(token, secret);
        return decoded
    }
    catch(e){
        console.error("token incorrecto ", e)
        return null;
    }
}