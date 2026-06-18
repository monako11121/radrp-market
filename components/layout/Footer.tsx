export default function Footer(){

return(

<footer
style={{
marginTop:120,
borderTop:"1px solid rgba(255,255,255,.06)",
padding:"60px 0",
}}
>

<div className="container">

<div
style={{
display:"flex",
justifyContent:"space-between",
gap:40,
flexWrap:"wrap",
}}
>

<div>

<div
style={{
fontSize:28,
fontWeight:900,
}}
>

<span style={{color:"#fff"}}>
RAD
</span>

<span style={{color:"#ff9a00"}}>
RP
</span>

</div>

<p
style={{
marginTop:12,
color:"#7e8796",
maxWidth:260,
lineHeight:1.6,
}}
>

Маркетплейс для игроков проекта
Radmir RP

</p>

</div>

<div>

<h3 style={{marginBottom:18}}>
Навигация
</h3>

<div
style={{
display:"flex",
flexDirection:"column",
gap:12,
color:"#7e8796",
}}
>

<a href="/">
Главная
</a>

<a href="/catalog">
Каталог
</a>

<a href="/sell">
Продать
</a>

<a href="/deals">
Сделки
</a>

</div>

</div>

<div>

<h3 style={{marginBottom:18}}>
Информация
</h3>

<div
style={{
display:"flex",
flexDirection:"column",
gap:12,
color:"#7e8796",
}}
>

<a href="/support">
Поддержка
</a>

<a href="/guarantee">
Как работает гарант
</a>

<a href="/rules">
Правила платформы
</a>

<a href="/faq">
Частые вопросы
</a>

</div>

</div>

</div>

</div>

</footer>

);

}