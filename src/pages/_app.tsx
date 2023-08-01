import { type AppType } from "next/app";
import { ClerkProvider } from '@clerk/nextjs';
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Layout from "~/components/Layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return(  
  <ClerkProvider {...pageProps} 
  appearance={
    {
      layout: {
        helpPageUrl: "/subscription",
      }
    }
  }
  localization={
    {
      signIn: {
        start: {
          subtitle: "to continue to Motiflex",
        }
      }
    }
  }
  >
    <Layout>
    <Component {...pageProps} />
    </Layout>

  </ClerkProvider>)
  
};

export default api.withTRPC(MyApp);
