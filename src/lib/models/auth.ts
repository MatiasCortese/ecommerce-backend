import { firestoreAdmin } from "@/lib/firestore";

const collection = firestoreAdmin.collection("auth");

export class Auth {
    ref: FirebaseFirestore.DocumentReference;
    data: any;
    id: string;
    constructor(id: string) {
        this.ref = collection.doc(id);
        this.id = id;
    }
    async pull(){
        const snap = await this.ref.get();
        if (!snap.exists) {
            throw new Error(`Auth with id ${this.id} does not exist`);
        }
        this.data = snap.data();
    }
    async push() {
        if (!this.data) {
            throw new Error("Data is not set");
        }
        await this.ref.update(this.data);
    }
    static async findAuthByEmail(email: string) {
        const cleanEmail = email.toLowerCase().trim();
        const results = await collection.where("email", "==", cleanEmail).get();
        if(results.docs.length){
            const doc = results.docs[0];
            const auth = new Auth(doc.id);
            auth.data = doc.data();
            return auth;
        } else {
            return null;
        }
    }
    static async createNewAuth(data:any){
        const newUserSnap = await collection.add(data);
        const newUser = new Auth(newUserSnap.id);
        newUser.data = data;
        return newUser;
    }
    static async getEmailAndCode(email: string, code: number) {
        const cleanEmail = email.toLowerCase().trim();
        const results = await collection.where("email", "==", cleanEmail).where("code", "==", code).get();
        if(results.docs.length){
            const firstResult = results.docs[0];
            const doc = results.docs[0];
            const auth = new Auth(doc.id);
            auth.data = doc.data();
        return auth;
        } else {
            return null
        }
    }
}