/* eslint-disable @typescript-eslint/no-unused-vars */
import "@/styles/globals.css";
import { AppProps } from "next/app";
import Head from "next/head";

import { TurnkeyProvider } from "@turnkey/sdk-react";
import { Auth0Provider } from "@auth0/auth0-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth0 } from "convex/react-auth0";
import { UserContextProvider } from "@/context/UserContext";

const turnkeyConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
  defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
  rpId: process.env.NEXT_PUBLIC_RPID!,
  iframeUrl:
    process.env.NEXT_PUBLIC_AUTH_IFRAME_URL ?? "https://auth.turnkey.com",
};
const convex = new ConvexReactClient('https://polished-zebra-298.convex.cloud');

function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <TurnkeyProvider config={turnkeyConfig}>
        <Head>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        </Head>
        <Auth0Provider
    domain="dev-l10jsbkoffyfpuzl.us.auth0.com"
    clientId="QeAlqRxfahLiLUZ01IN2EXjq8ixw7B1H"
    authorizationParams={{
      redirect_uri: typeof window !== "undefined" ? window.location.origin : "",
    }}
  >
            <Component {...pageProps} />
       

  </Auth0Provider>,
        
      
      </TurnkeyProvider>
    </div>
  );
}

export default App;