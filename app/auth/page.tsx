"use client";

import { registerUser }
from "../actions/auth";

import { signIn }
from "next-auth/react";

import {
useState,
useActionState,
useEffect,
Suspense,
} from "react";

import { useSearchParams } from "next/navigation";

const inputStyle = {
width:"100%",
height:58,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
} as const;

const labelStyle = {
marginBottom:10,
fontSize:14,
color:"#7e8796",
} as const;

function AuthPageInner(){

const searchParams = useSearchParams();
const registered   = searchParams.get("registered") === "1";

const [isLogin,setIsLogin] =
useState(true);

// При редиректе после регистрации переключаемся на форму входа
useEffect(()=>{
if(registered) setIsLogin(true);
},[registered]);

// --- Регистрация ---
const [registerState,registerAction,isPending] =
useActionState(registerUser, null);

// --- Вход ---
const [loginEmail,setLoginEmail] =
useState("");

const [loginPassword,setLoginPassword] =
useState("");

const [loginError,setLoginError] =
useState<string | null>(null);

const [loginPending,setLoginPending] =
useState(false);

async function handleLogin(){

if(!loginEmail || !loginPassword) return;

setLoginError(null);
setLoginPending(true);

try{

const result =
await signIn("credentials",{
email: loginEmail,
password: loginPassword,
redirect: false,
});

if(result?.error){
setLoginError("Неверный email или пароль");
}else{
window.location.href = "/";
}

}catch{

setLoginError("Ошибка входа. Попробуйте ещё раз.");

}finally{

setLoginPending(false);

}

}

function switchToRegister(){
setIsLogin(false);
setLoginError(null);
}

function switchToLogin(){
setIsLogin(true);
setLoginError(null);
}

return(

<main
className="container"
style={{
paddingTop:80,
paddingBottom:100,
display:"flex",
justifyContent:"center",
}}
>

<div
className="card"
style={{
width:"100%",
maxWidth:520,
padding:36,
}}
>

<div
style={{
textAlign:"center",
marginBottom:34,
}}
>

<h1
style={{
fontSize:48,
fontWeight:900,
marginBottom:18,
}}
>

{isLogin ? "Вход в аккаунт" : "Создание аккаунта"}

</h1>

<p
style={{
color:"#7e8796",
fontSize:17,
lineHeight:1.7,
}}
>

Авторизация для покупателей
и продавцов Radmir RP.

</p>

</div>

{registered && (
<div
style={{
padding:"14px 18px",
borderRadius:14,
background:"rgba(34,197,94,.12)",
border:"1px solid rgba(34,197,94,.25)",
color:"#22c55e",
fontSize:15,
marginBottom:24,
textAlign:"center",
}}
>
✅ Аккаунт создан — теперь войдите
</div>
)}

{isLogin ? (

// ---- ФОРМА ВХОДА — без <form>, контролируемые инпуты ----
<div
style={{
display:"flex",
flexDirection:"column",
gap:20,
}}
>

<div>
<div style={labelStyle}>Email</div>
<input
type="email"
placeholder="example@gmail.com"
value={loginEmail}
onChange={(e)=>setLoginEmail(e.target.value)}
onKeyDown={(e)=>{ if(e.key==="Enter") handleLogin(); }}
style={inputStyle}
/>
</div>

<div>
<div style={labelStyle}>Пароль</div>
<input
type="password"
placeholder="Введите пароль"
value={loginPassword}
onChange={(e)=>setLoginPassword(e.target.value)}
onKeyDown={(e)=>{ if(e.key==="Enter") handleLogin(); }}
style={inputStyle}
/>
</div>

{loginError && (
<div
style={{
padding:"14px 18px",
borderRadius:14,
background:"rgba(239,68,68,.12)",
border:"1px solid rgba(239,68,68,.22)",
color:"#ef4444",
fontSize:15,
}}
>
{loginError}
</div>
)}

<button
type="button"
className="orangeButton"
disabled={loginPending}
onClick={handleLogin}
style={{
width:"100%",
height:58,
marginTop:8,
opacity: loginPending ? 0.6 : 1,
}}
>
{loginPending ? "Загрузка..." : "Войти"}
</button>

<button
type="button"
onClick={switchToRegister}
className="darkButton"
style={{
width:"100%",
height:58,
}}
>
Создать аккаунт
</button>

</div>

) : (

// ---- ФОРМА РЕГИСТРАЦИИ — через useActionState ----
<form
action={registerAction}
style={{
display:"flex",
flexDirection:"column",
gap:20,
}}
>

<div>
<div style={labelStyle}>Username</div>
<input
name="username"
placeholder="Vadym"
required
style={inputStyle}
/>
</div>

<div>
<div style={labelStyle}>Email</div>
<input
name="email"
type="email"
placeholder="example@gmail.com"
required
style={inputStyle}
/>
</div>

<div>
<div style={labelStyle}>Пароль</div>
<input
name="password"
type="password"
placeholder="Минимум 8 символов"
required
style={inputStyle}
/>
</div>

{registerState?.error && (
<div
style={{
padding:"14px 18px",
borderRadius:14,
background:"rgba(239,68,68,.12)",
border:"1px solid rgba(239,68,68,.22)",
color:"#ef4444",
fontSize:15,
}}
>
{registerState.error}
</div>
)}

<button
type="submit"
className="orangeButton"
disabled={isPending}
style={{
width:"100%",
height:58,
marginTop:8,
opacity: isPending ? 0.6 : 1,
}}
>
{isPending ? "Загрузка..." : "Создать аккаунт"}
</button>

<button
type="button"
onClick={switchToLogin}
className="darkButton"
style={{
width:"100%",
height:58,
}}
>
Уже есть аккаунт
</button>

</form>

)}

<div
style={{
marginTop:30,
paddingTop:24,
borderTop:"1px solid rgba(255,255,255,.06)",
textAlign:"center",
color:"#7e8796",
lineHeight:1.7,
}}
>

Продолжая, вы соглашаетесь
с правилами платформы.

</div>

</div>

</main>

);

}

export default function AuthPage(){
return(
<Suspense>
<AuthPageInner />
</Suspense>
);
}
