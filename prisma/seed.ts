import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(){

const user = await prisma.user.create({

data:{

username:"Vadym",
email:"vadym@gmail.com",
password:"123456",

availableBalance:12450,

},

});

await prisma.product.createMany({

data:[

{
title:"BMW M5 F90",
description:"Stage 2",
price:1250000,
category:"Транспорт",
server:12,
sellerId:user.id,
},

{
title:"Вирты",
description:"10кк",
price:2000,
category:"Вирты",
server:5,
sellerId:user.id,
},

{
title:"Дом в Рублёвке",
description:"Элитный дом",
price:35000,
category:"Имущество",
server:3,
sellerId:user.id,
},

],

});

}

main()
.then(async()=>{

await prisma.$disconnect();

})
.catch(async(e)=>{

console.error(e);

await prisma.$disconnect();

process.exit(1);

});