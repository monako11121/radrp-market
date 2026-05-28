import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Provider
from "@/components/providers/SessionProvider";

export default function RootLayout({
children,
}:{
children:React.ReactNode;
}){

return(

<html lang="ru">

<body>

<Provider>

<Header/>

{children}

<Footer/>

</Provider>

</body>

</html>

);

}