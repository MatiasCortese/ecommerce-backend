import {firestoreAdmin} from "@/lib/firestore";

const collection = firestoreAdmin.collection("users");

export class User {
    ref: FirebaseFirestore.DocumentReference;
    data: any;
    public id: string;
    constructor(id: string){
        this.id = id;
        this.ref = collection.doc(id);
    }
    async pull(){
        const snap = await this.ref.get();
        this.data = snap.data();
    }
    async push(){
        this.ref.update(this.data); 
    }
    static async findById(id: string) {
        const user = new User(id);
        await user.pull();
        if (!user.data) {
            throw new Error(`User with id ${id} does not exist`);
        }
        return user;
    }
    static async createNewUser(data: any){
        try {
            const newUserSnap = await collection.add(data);
            if(!newUserSnap.id){
                throw new Error("Firestore no generó un id válido o es undefined");
            }
            const newUserSnapData = await newUserSnap.get();
            const newUser = new User(newUserSnapData.id);
            newUser.id = newUserSnapData.id;
            newUser.data = data;
            return newUser;
        }
        catch (e){
            console.error("Error al crear el User: ", e)
            throw Error
        }
    }
    async updateData(data: { name?: string; last_name?: string; phone?: string; address?: string }) {
    const allowedFields = ["name", "last_name", "phone", "address"];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (data[field as keyof typeof data] !== undefined) {
        updateData[field] = data[field as keyof typeof data];
        this.data[field] = data[field as keyof typeof data];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No valid fields to update");
    }

    await this.ref.update(updateData);
  }
}