import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import Header from "./components/Header.tsx"
import Footer from "./components/Footer.tsx"
import { runViewTransition } from "./hooks/useViewTransitionNavigate";
import { preloadNonCriticalRoutes } from "./routes/lazyPages";

export default function App() {
  const outlet = useOutlet();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [popOutlet, setPopOutlet] = useState(outlet);
  const outletRef = useRef(outlet);
  outletRef.current = outlet;
  const currentOutlet = navigationType === "POP" ? popOutlet : outlet;
  const [lastStableOutlet, setLastStableOutlet] = useState(() => currentOutlet);

  useLayoutEffect(() => {
    const nextOutlet = outletRef.current;
    if (navigationType !== "POP") {
      setPopOutlet(nextOutlet);
      return;
    }

    runViewTransition(() => {
      setPopOutlet(nextOutlet);
    });
  }, [navigationType, location.key]);

  useEffect(() => {
    setLastStableOutlet(currentOutlet);
  }, [location.key, currentOutlet]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void preloadNonCriticalRoutes();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <Header />
      <main id="top">
        <Suspense fallback={lastStableOutlet}>
          {currentOutlet}
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
