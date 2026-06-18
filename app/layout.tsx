import "./globals.css";
import type { Metadata } from "next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Provider
from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: {
    default: "RADRP Market",
    template: "%s — RADRP Market",
  },
  description: "Безопасный маркетплейс для покупки и продажи игровых ценностей Radmir RP. Гарант-сделки, защита от мошенников.",
  metadataBase: new URL("https://radrpmarket.com"),
  openGraph: {
    siteName: "RADRP Market",
    type: "website",
    locale: "ru_RU",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-icon.svg",
  },
};

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