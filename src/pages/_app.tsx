import { type AppType } from "next/app";
import { ClerkProvider } from '@clerk/nextjs';
import { api } from "~/utils/api";
import Script from "next/script";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return(  <ClerkProvider {...pageProps} 
  appearance={
    {
      layout: {
        logoImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/LEGO_logo.svg/2048px-LEGO_logo.svg.png"
        ,logoPlacement: "outside"
      }
    }
  } >

    <Component {...pageProps} />


  </ClerkProvider>)
  
};

export default api.withTRPC(MyApp);
