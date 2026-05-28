import { prisma } from "@/lib/prisma";

import bcrypt from "bcrypt";

import {
AuthOptions,
} from "next-auth";

import CredentialsProvider
from "next-auth/providers/credentials";

export const authOptions:
AuthOptions = {

providers:[

CredentialsProvider({

name:"credentials",

credentials:{

email:{},
password:{},

},

async authorize(credentials){

if(!credentials){

return null;

}

const user =
await prisma.user.findUnique({

where:{
email:credentials.email,
},

});

if(!user){

return null;

}

const isValid =
await bcrypt.compare(
credentials.password,
user.password
);

if(!isValid){

return null;

}

return{

id:user.id,
email:user.email,
name:user.username,
balance:user.balance,

};

},

}),

],

session:{
strategy:"jwt",
},

callbacks:{

async jwt({
token,
user,
}){

if(user){

token.id = user.id;
token.balance = user.balance;

}

return token;

},

async session({
session,
token,
}){

if(session.user){

session.user.id =
token.id as string;

session.user.balance =
token.balance as number;

}

return session;

},

},

secret:
process.env.NEXTAUTH_SECRET,

};