import { AppProps } from "next/app";
import "../globals.css"; // Import global styles

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="layout bg-blue-500">
      <header>My App Header</header>
      <br></br>
      <br></br>
      <br></br>
      <Component {...pageProps} />
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <footer>My App Footer</footer>
    </div>
  );
}
