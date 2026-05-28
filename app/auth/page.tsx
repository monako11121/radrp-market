"use client";

import { registerUser } from "../actions/auth";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AuthPage(){

const [isLogin,setIsLogin] =
useState(true);

async function handleLogin(
formData:FormData
){

const email =
formData.get("email") as string;

const password =
formData.get("password") as string;

await signIn("credentials",{

email,
password,

callbackUrl:"/",

});

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

{isLogin
? "Вход в аккаунт"
: "Создание аккаунта"}

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

<form
action={
isLogin
? handleLogin
: registerUser
}
style={{
display:"flex",
flexDirection:"column",
gap:20,
}}
>

{!isLogin && (

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Username

</div>

<input
name="username"
placeholder="Vadym"
required
style={{
width:"100%",
height:58,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
/>

</div>

)}

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Email

</div>

<input
name="email"
type="email"
placeholder="example@gmail.com"
required
style={{
width:"100%",
height:58,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
/>

</div>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Пароль

</div>

<input
name="password"
type="password"
placeholder="Введите пароль"
required
style={{
width:"100%",
height:58,
background:"#0d1219",
border:"1px solid #1d2734",
borderRadius:16,
padding:"0 18px",
color:"white",
outline:"none",
fontSize:15,
}}
/>

</div>

<button
type="submit"
className="orangeButton"
style={{
width:"100%",
height:58,
marginTop:8,
}}
>

{isLogin
? "Войти"
: "Создать аккаунт"}

</button>

<button
type="button"
onClick={()=>
setIsLogin(!isLogin)
}
className="darkButton"
style={{
width:"100%",
height:58,
}}
>

{isLogin
? "Создать аккаунт"
: "Уже есть аккаунт"}

</button>

</form>

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