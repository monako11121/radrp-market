export default function SettingsPage(){

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
fontSize:56,
fontWeight:900,
marginBottom:18,
}}
>

Настройки профиля

</h1>

<p
style={{
fontSize:18,
color:"#7e8796",
maxWidth:760,
lineHeight:1.8,
}}
>

Управление аккаунтом,
безопасностью и уведомлениями.

</p>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"320px 1fr",
gap:24,
alignItems:"start",
}}
>

<div
className="card"
style={{
padding:24,
position:"sticky",
top:110,
display:"flex",
flexDirection:"column",
gap:14,
}}
>

<div
className="card"
style={{
padding:"16px 18px",
background:"rgba(255,153,0,.08)",
border:"1px solid rgba(255,153,0,.16)",
}}
>

Основное

</div>

<div
className="card"
style={{
padding:"16px 18px",
}}
>

Безопасность

</div>

<div
className="card"
style={{
padding:"16px 18px",
}}
>

Уведомления

</div>

<div
className="card"
style={{
padding:"16px 18px",
}}
>

Приватность

</div>

</div>

<div
className="card"
style={{
padding:32,
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:24,
marginBottom:36,
}}
>

<div
style={{
width:100,
height:100,
borderRadius:"50%",
background:
"linear-gradient(180deg,#202938,#121821)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:34,
fontWeight:800,
}}
>

V

</div>

<div>

<h2
style={{
fontSize:32,
fontWeight:800,
marginBottom:12,
}}
>

Vadym

</h2>

<button
className="darkButton"
style={{
height:46,
}}
>

Изменить аватар

</button>

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:20,
}}
>

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
defaultValue="Vadym"
style={{
width:"100%",
height:56,
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

Email

</div>

<input
defaultValue="vadym@gmail.com"
style={{
width:"100%",
height:56,
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

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:30,
}}
>

<div>

<div
style={{
marginBottom:10,
fontSize:14,
color:"#7e8796",
}}
>

Новый пароль

</div>

<input
type="password"
placeholder="Введите пароль"
style={{
width:"100%",
height:56,
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

Повторите пароль

</div>

<input
type="password"
placeholder="Повторите пароль"
style={{
width:"100%",
height:56,
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

</div>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"22px 0",
borderTop:"1px solid rgba(255,255,255,.06)",
borderBottom:"1px solid rgba(255,255,255,.06)",
marginBottom:30,
}}
>

<div>

<div
style={{
fontSize:18,
fontWeight:700,
marginBottom:8,
}}
>

Уведомления о сделках

</div>

<div
style={{
color:"#7e8796",
}}
>

Получать обновления по сделкам и спорам

</div>

</div>

<div
style={{
width:58,
height:32,
borderRadius:999,
background:"#ff9a00",
display:"flex",
alignItems:"center",
padding:4,
justifyContent:"flex-end",
}}
>

<div
style={{
width:24,
height:24,
borderRadius:"50%",
background:"white",
}}
/>

</div>

</div>

<div
style={{
display:"flex",
gap:16,
}}
>

<button
className="orangeButton"
style={{
height:58,
padding:"0 32px",
}}
>

Сохранить изменения

</button>

<button
className="darkButton"
style={{
height:58,
padding:"0 32px",
}}
>

Отмена

</button>

</div>

</div>

</div>

</main>

);

}