"use client";

import Link from "next/link";

import {
signOut,
useSession,
} from "next-auth/react";

import {
useState,
} from "react";

export default function Header(){

const { data:session } =
useSession();

const [menuOpen,setMenuOpen] =
useState(false);

return(

<header
style={{
position:"sticky",
top:0,
zIndex:100,
backdropFilter:"blur(18px)",
background:"rgba(6,8,12,.78)",
borderBottom:"1px solid rgba(255,255,255,.05)",
}}
>

<div className="container">

<div
style={{
height:84,
display:"flex",
alignItems:"center",
justifyContent:"space-between",
gap:24,
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:42,
}}
>

<Link
href="/"
style={{
display:"flex",
flexDirection:"column",
lineHeight:1,
textDecoration:"none",
}}
>

<span
style={{
fontSize:34,
fontWeight:900,
}}
>

<span style={{color:"#fff"}}>
RAD
</span>

<span style={{color:"#ff9a00"}}>
RP
</span>

</span>

<span
style={{
fontSize:11,
letterSpacing:3,
color:"#7e8796",
marginTop:5,
}}
>

MARKET

</span>

</Link>

<nav
className="desktopNav"
style={{
display:"flex",
alignItems:"center",
gap:14,
}}
>

<Link href="/">

<div className="navButton">
Главная
</div>

</Link>

<Link href="/catalog">

<div className="navButton">
Каталог
</div>

</Link>

<Link href="/favorites">

<div className="navButton">
Избранное
</div>

</Link>

<Link href="/deals">

<div className="navButton">
Сделки
</div>

</Link>

<Link href="/disputes">

<div className="navButton">
Споры
</div>

</Link>

</nav>

</div>

<div
style={{
display:"flex",
alignItems:"center",
gap:14,
}}
>

<div
className="desktopActions"
style={{
display:"flex",
alignItems:"center",
gap:14,
}}
>

{session?.user ? (

<>

<div
className="card"
style={{
padding:"12px 18px",
display:"flex",
alignItems:"center",
gap:12,
}}
>

<div
style={{
fontSize:14,
color:"#7e8796",
}}
>

Баланс

</div>

<div
style={{
fontWeight:800,
}}
>

${(session.user as any).balance || 0}

</div>

</div>

<Link href="/sell">

<button
className="orangeButton"
style={{
height:48,
}}
>

Продать

</button>

</Link>

<Link
href="/profile"
style={{
textDecoration:"none",
}}
>

<div
style={{
width:48,
height:48,
borderRadius:"50%",
background:
"linear-gradient(180deg,#202938,#121821)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontWeight:700,
color:"white",
}}
>

{session.user.name?.[0]}

</div>

</Link>

<button
onClick={()=>
signOut({
callbackUrl:"/",
})
}
className="darkButton"
style={{
height:48,
}}
>

Выйти

</button>

</>

) : (

<Link href="/auth">

<button
className="orangeButton"
style={{
height:48,
}}
>

Войти

</button>

</Link>

)}

</div>

<button
className="mobileMenuButton"
onClick={()=>
setMenuOpen(!menuOpen)
}
style={{
width:48,
height:48,
borderRadius:14,
background:"#121821",
border:"1px solid #232d3d",
color:"white",
fontSize:24,
display:"none",
}}
>

☰

</button>

</div>

</div>

{
menuOpen && (

<div
className="mobileMenu"
style={{
paddingBottom:20,
display:"flex",
flexDirection:"column",
gap:12,
}}
>

<Link href="/catalog">

<div className="navButton">
Каталог
</div>

</Link>

<Link href="/favorites">

<div className="navButton">
Избранное
</div>

</Link>

<Link href="/deals">

<div className="navButton">
Сделки
</div>

</Link>

<Link href="/disputes">

<div className="navButton">
Споры
</div>

</Link>

<Link href="/sell">

<div className="navButton">
Продать
</div>

</Link>

<Link href="/profile">

<div className="navButton">
Профиль
</div>

</Link>

</div>

)
}

</div>

</header>

);

}