"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { formatMoney } from "@/lib/formatMoney";

const ADMIN_MENU = [
  { label: "Споры",      href: "/admin/disputes",   active: true  },
  { label: "Тикеты",     href: "/admin/tickets",    active: true  },
  { label: "Выводы",     href: "/admin/withdrawals",active: true  },
  { label: "Статистика", href: "/admin/stats",      active: false },
];

export default function Header(){

const { data:session } = useSession();

const [menuOpen,  setMenuOpen]  = useState(false);
const [adminOpen, setAdminOpen] = useState(false);
const [balance,     setBalance]     = useState<number | null>(null);
const [frozen,      setFrozen]      = useState<number>(0);
const [isAdmin,     setIsAdmin]     = useState(false);
const [unreadCount, setUnreadCount] = useState(0);

const adminRef = useRef<HTMLDivElement>(null);
const pathname = usePathname();

// Загружаем баланс и флаг isAdmin; сбрасываем при выходе
useEffect(()=>{
if(!session?.user?.email){
setBalance(null);
setFrozen(0);
setIsAdmin(false);
setUnreadCount(0);
return;
}
fetch("/api/balance")
.then((r)=> r.ok ? r.json() : null)
.then((data)=>{
if(!data) return;
if(typeof data.availableBalance === "number") setBalance(data.availableBalance);
else if(typeof data.balance === "number")     setBalance(data.balance);
if(typeof data.frozenBalance === "number")    setFrozen(data.frozenBalance);
if(typeof data.isAdmin === "boolean")         setIsAdmin(data.isAdmin);
if(typeof data.unreadCount === "number")      setUnreadCount(data.unreadCount);
})
.catch(()=>{});
},[session?.user?.email, pathname]);

// Закрыть выпадашку при клике вне
useEffect(()=>{
if(!adminOpen) return;
const handler = (e: MouseEvent) => {
if(adminRef.current && !adminRef.current.contains(e.target as Node)){
setAdminOpen(false);
}
};
document.addEventListener("mousedown", handler);
return ()=> document.removeEventListener("mousedown", handler);
},[adminOpen]);

const displayBalance = balance ?? 0;

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

{/* Лого + навигация */}
<div style={{ display:"flex", alignItems:"center", gap:42 }}>

<Link
href="/"
style={{ display:"flex", flexDirection:"column", lineHeight:1, textDecoration:"none" }}
>
<span style={{ fontSize:34, fontWeight:900 }}>
<span style={{ color:"#fff" }}>RAD</span>
<span style={{ color:"#ff9a00" }}>RP</span>
</span>
<span style={{ fontSize:11, letterSpacing:3, color:"#7e8796", marginTop:5 }}>MARKET</span>
</Link>

<nav className="desktopNav" style={{ display:"flex", alignItems:"center", gap:14 }}>

<Link href="/"><div className="navButton">Главная</div></Link>
<Link href="/catalog"><div className="navButton">Каталог</div></Link>
<Link href="/favorites"><div className="navButton">Избранное</div></Link>
<Link href="/deals"><div className="navButton">Сделки</div></Link>
<Link href="/disputes"><div className="navButton">Споры</div></Link>
<Link href="/support"><div className="navButton">Поддержка</div></Link>
<Link href="/transactions"><div className="navButton">История</div></Link>

{/* Выпадающее меню админа (десктоп) */}
{isAdmin && (
<div ref={adminRef} style={{ position:"relative" }}>

<button
onClick={()=>setAdminOpen(v=>!v)}
style={{
height:38,
padding:"0 14px",
borderRadius:12,
background: adminOpen
? "rgba(239,68,68,.18)"
: "rgba(239,68,68,.10)",
border:"1px solid rgba(239,68,68,.35)",
color:"#ef4444",
fontWeight:700,
fontSize:14,
cursor:"pointer",
display:"flex",
alignItems:"center",
gap:6,
whiteSpace:"nowrap",
}}
>
⚙ Админка
<span style={{ fontSize:10, opacity:.8 }}>
{adminOpen ? "▲" : "▼"}
</span>
</button>

{adminOpen && (
<div
style={{
position:"absolute",
top:"calc(100% + 8px)",
right:0,
minWidth:190,
background:"#121821",
border:"1px solid #1d2734",
borderRadius:16,
padding:"8px 0",
boxShadow:"0 16px 48px rgba(0,0,0,.6)",
zIndex:200,
}}
>
{ADMIN_MENU.map((item)=>(
<div key={item.href}>
{item.active ? (
<Link
href={item.href}
onClick={()=>setAdminOpen(false)}
style={{ textDecoration:"none" }}
>
<div
style={{
padding:"10px 18px",
fontSize:14,
color:"white",
cursor:"pointer",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
}}
className="adminMenuItem"
>
{item.label}
<span style={{ fontSize:12, color:"#22c55e" }}>●</span>
</div>
</Link>
) : (
<div
style={{
padding:"10px 18px",
fontSize:14,
color:"#4a5568",
cursor:"not-allowed",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
}}
>
{item.label}
<span style={{ fontSize:11, color:"#4a5568" }}>скоро</span>
</div>
)}
</div>
))}
</div>
)}

</div>
)}

</nav>

</div>

{/* Правая часть: баланс, кнопки */}
<div style={{ display:"flex", alignItems:"center", gap:14 }}>

<div className="desktopActions" style={{ display:"flex", alignItems:"center", gap:14 }}>

{session?.user ? (
<>

<div
className="card"
style={{
padding:"10px 16px",
display:"flex",
flexDirection:"column",
alignItems:"center",
justifyContent:"center",
gap:2,
minWidth:90,
}}
>
<div style={{ fontSize:12, color:"#7e8796", lineHeight:1 }}>Баланс</div>
<div style={{ fontWeight:800, fontSize:16, lineHeight:1 }}>
{formatMoney(displayBalance)}
</div>
{frozen > 0 && (
<div style={{ fontSize:11, color:"#ffb340", lineHeight:1 }}>
заморожено {formatMoney(frozen)}
</div>
)}
</div>

<Link href="/sell">
<button className="orangeButton" style={{ height:48 }}>Продать</button>
</Link>

<Link href="/notifications" style={{ textDecoration:"none" }}>
<div style={{ position:"relative", width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center" }}>
<div
style={{
width:40, height:40, borderRadius:14,
background:"#121821", border:"1px solid #232d3d",
display:"flex", alignItems:"center", justifyContent:"center",
fontSize:18, cursor:"pointer",
}}
>
🔔
</div>
{unreadCount > 0 && (
<div style={{
position:"absolute", top:-4, right:-4,
minWidth:18, height:18, borderRadius:999,
background:"#ff9a00", color:"black",
fontSize:11, fontWeight:900,
display:"flex", alignItems:"center", justifyContent:"center",
padding:"0 4px",
}}>
{unreadCount > 99 ? "99+" : unreadCount}
</div>
)}
</div>
</Link>

<Link href="/profile" style={{ textDecoration:"none" }}>
<div
style={{
width:48, height:48, borderRadius:"50%",
background:"linear-gradient(180deg,#202938,#121821)",
display:"flex", alignItems:"center", justifyContent:"center",
fontWeight:700, color:"white",
}}
>
{session.user.name?.[0] ?? "?"}
</div>
</Link>

<button
onClick={()=>signOut({ callbackUrl:"/" })}
className="darkButton"
style={{ height:48 }}
>
Выйти
</button>

</>
) : (
<Link href="/auth">
<button className="orangeButton" style={{ height:48 }}>Войти</button>
</Link>
)}

</div>

{/* Кнопка мобильного меню */}
<button
className="mobileMenuButton"
onClick={()=>setMenuOpen(!menuOpen)}
style={{
width:48, height:48, borderRadius:14,
background:"#121821", border:"1px solid #232d3d",
color:"white", fontSize:24, display:"none",
}}
>
☰
</button>

</div>

</div>

{/* Мобильное меню */}
{menuOpen && (
<div
className="mobileMenu"
style={{ paddingBottom:20, display:"flex", flexDirection:"column", gap:12 }}
>

<Link href="/catalog" onClick={()=>setMenuOpen(false)}>
<div className="navButton">Каталог</div>
</Link>
<Link href="/favorites" onClick={()=>setMenuOpen(false)}>
<div className="navButton">Избранное</div>
</Link>
<Link href="/deals" onClick={()=>setMenuOpen(false)}>
<div className="navButton">Сделки</div>
</Link>
<Link href="/disputes" onClick={()=>setMenuOpen(false)}>
<div className="navButton">Споры</div>
</Link>
<Link href="/support" onClick={()=>setMenuOpen(false)}>
<div className="navButton">Поддержка</div>
</Link>
<Link href="/sell" onClick={()=>setMenuOpen(false)}>
<div className="navButton">Продать</div>
</Link>
<Link href="/profile" onClick={()=>setMenuOpen(false)}>
<div className="navButton">Профиль</div>
</Link>
<Link href="/notifications" onClick={()=>setMenuOpen(false)}>
<div className="navButton" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
<span>Уведомления</span>
{unreadCount > 0 && (
<span style={{
minWidth:20, height:20, borderRadius:999,
background:"#ff9a00", color:"black",
fontSize:11, fontWeight:900,
display:"inline-flex", alignItems:"center", justifyContent:"center",
padding:"0 5px",
}}>
{unreadCount > 99 ? "99+" : unreadCount}
</span>
)}
</div>
</Link>

{/* Секция админа в мобильном меню */}
{isAdmin && (
<>
<div
style={{
fontSize:11,
color:"#ef4444",
fontWeight:700,
letterSpacing:1,
padding:"4px 0 0",
}}
>
АДМИН-ПАНЕЛЬ
</div>

{ADMIN_MENU.map((item)=>
item.active ? (
<Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)}>
<div className="navButton" style={{ color:"#ef4444" }}>
{item.label}
</div>
</Link>
) : (
<div
key={item.href}
className="navButton"
style={{ color:"#4a5568", cursor:"not-allowed" }}
>
{item.label} <span style={{ fontSize:11 }}>(скоро)</span>
</div>
)
)}
</>
)}

</div>
)}

</div>

</header>

);

}
