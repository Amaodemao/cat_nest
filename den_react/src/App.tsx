import { Outlet } from "react-router-dom"
import Header from "./components/Header.tsx"
import Footer from "./components/Footer.tsx"

export default function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
