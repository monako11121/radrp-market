import Link from "next/link";

import { prisma } from "@/lib/prisma";

import {
categoryIcons,
} from "@/lib/categoryIcons";

export default async function CatalogPage({
searchParams,
}:{
searchParams:Promise<{
search?:string;
category?:string;
server?:string;
sort?:string;
page?:string;
}>;
}){

const params =
await searchParams;

const search =
params.search || "";

const category =
params.category || "";

const server =
params.server || "";

const sort =
params.sort || "newest";

const currentPage =
Number(params.page || "1");

const productsPerPage = 12;

const where = {

AND:[

search
? {
title:{
contains:search,
mode:"insensitive",
},
}
: {},

category
? {
category:category,
}
: {},

server
? {
server:Number(server),
}
: {},

],

};

const totalProducts =
await prisma.product.count({
where,
});

const totalPages =
Math.ceil(
totalProducts /
productsPerPage
);

const products =
await prisma.product.findMany({

where,

skip:
(currentPage - 1)
*
productsPerPage,

take:productsPerPage,

orderBy:
sort === "cheap"
? {
price:"asc",
}
: sort === "expensive"
? {
price:"desc",
}
: {
createdAt:"desc",
},

});

return(

<main
className="container"
style={{
paddingTop:60,
paddingBottom:100,
}}
>

<div
style={{
marginBottom:40,
}}
>

<h1
style={{
fontSize:"clamp(38px,6vw,56px)",
fontWeight:900,
marginBottom:18,
}}
>

Каталог товаров

</h1>

<p
style={{
fontSize:18,
color:"#7e8796",
maxWidth:700,
lineHeight:1.7,
}}
>

Товары теперь загружаются
из настоящей базы данных.

</p>

</div>

<div
className="catalogLayout"
style={{
display:"grid",
gridTemplateColumns:"300px 1fr",
gap:22,
alignItems:"start",
}}
>

<div
className="card"
style={{
padding:24,
position:"sticky",
top:110,
}}
>

<h2
style={{
fontSize:24,
fontWeight:700,
marginBottom:24,
}}
>

Фильтры

</h2>

<form
method="GET"
style={{
display:"flex",
flexDirection:"column",
gap:18,
}}
>

<input
name="search"
defaultValue={search}
placeholder="Поиск товаров..."
style={{
width:"100%",
height:52,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:14,
padding:"0 18px",
color:"white",
outline:"none",
}}
/>

<select
name="category"
defaultValue={category}
style={{
width:"100%",
height:52,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:14,
padding:"0 18px",
color:"white",
outline:"none",
}}
>

<option value="">
Все категории
</option>

<option value="Транспорт">
Транспорт
</option>

<option value="Имущество">
Имущество
</option>

<option value="Вирты">
Вирты
</option>

<option value="Аксессуары">
Аксессуары
</option>

</select>

<select
name="server"
defaultValue={server}
style={{
width:"100%",
height:52,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:14,
padding:"0 18px",
color:"white",
outline:"none",
}}
>

<option value="">
Все сервера
</option>

{Array.from({ length: 21 }, (_, i) => (

<option
key={i + 1}
value={i + 1}
>

{String(i + 1).padStart(2, "0")}

</option>

))}

</select>

<select
name="sort"
defaultValue={sort}
style={{
width:"100%",
height:52,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:14,
padding:"0 18px",
color:"white",
outline:"none",
}}
>

<option value="newest">
Сначала новые
</option>

<option value="cheap">
Сначала дешевые
</option>

<option value="expensive">
Сначала дорогие
</option>

</select>

<button
className="orangeButton"
style={{
width:"100%",
}}
>

Применить

</button>

</form>

</div>

<div>

{products.length === 0 ? (

<div
className="card"
style={{
padding:40,
textAlign:"center",
}}
>

<h2
style={{
fontSize:32,
fontWeight:800,
marginBottom:18,
}}
>

Ничего не найдено

</h2>

<p
style={{
color:"#7e8796",
marginBottom:28,
}}
>

Попробуйте изменить фильтры
или поисковый запрос.

</p>

</div>

) : (

<>

<div
style={{
display:"grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(280px,1fr))",
gap:18,
marginBottom:30,
}}
>

{products.map((product)=>(

<Link
href={`/product/${product.id}`}
key={product.id}
style={{
textDecoration:"none",
}}
>

<div
className="card"
style={{
padding:22,
minHeight:280,
display:"flex",
flexDirection:"column",
justifyContent:"space-between",
cursor:"pointer",
}}
>

<div
style={{
height:120,
borderRadius:18,
background:
"linear-gradient(180deg,#151b25,#0d1117)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:54,
marginBottom:24,
}}
>

{
categoryIcons[
product.category as keyof typeof categoryIcons
]
}

</div>

<div>

<h3
style={{
fontSize:28,
fontWeight:700,
marginBottom:12,
color:"white",
}}
>

{product.title}

</h3>

<p
style={{
fontSize:15,
color:"#7e8796",
marginBottom:18,
}}
>

Сервер {product.server}

</p>

{
product.category === "Вирты"
? (

<div
style={{
display:"flex",
flexDirection:"column",
gap:10,
marginBottom:18,
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
fontSize:14,
}}
>

<span
style={{
color:"#7e8796",
}}
>

Наличие

</span>

<span
style={{
fontWeight:700,
}}
>

{product.stock}кк

</span>

</div>

<div
style={{
display:"flex",
justifyContent:"space-between",
fontSize:14,
}}
>

<span
style={{
color:"#7e8796",
}}
>

Цена за 1кк

</span>

<span
style={{
fontWeight:700,
color:"#ff9a00",
}}
>

${product.pricePerKK}

</span>

</div>

</div>

)
: (

<div
style={{
fontSize:24,
fontWeight:800,
color:"#ff9a00",
marginBottom:18,
}}
>

${product.price}

</div>

)
}

<div
style={{
display:"flex",
justifyContent:"flex-end",
}}
>

<div
style={{
color:"#ff9a00",
fontWeight:700,
fontSize:20,
}}
>

→

</div>

</div>

</div>

</div>

</Link>

))}

</div>

<div
style={{
display:"flex",
justifyContent:"center",
alignItems:"center",
gap:12,
flexWrap:"wrap",
}}
>

{currentPage > 1 && (

<Link
href={`?search=${search}&category=${category}&server=${server}&sort=${sort}&page=${currentPage - 1}`}
>

<button className="darkButton">

← Назад

</button>

</Link>

)}

{Array.from(
{ length: totalPages },
(_, i) => (

<Link
key={i}
href={`?search=${search}&category=${category}&server=${server}&sort=${sort}&page=${i + 1}`}
>

<button
style={{
width:48,
height:48,
borderRadius:12,
border:"1px solid #232d3d",
background:
currentPage === i + 1
? "#ff9a00"
: "#121821",
color:
currentPage === i + 1
? "black"
: "white",
fontWeight:700,
cursor:"pointer",
}}
>

{i + 1}

</button>

</Link>

))
}

{currentPage < totalPages && (

<Link
href={`?search=${search}&category=${category}&server=${server}&sort=${sort}&page=${currentPage + 1}`}
>

<button className="darkButton">

Далее →

</button>

</Link>

)}

</div>

</>

)}

</div>

</div>

</main>

);

}