import { flushSync } from "react-dom";
import { useNavigate, type NavigateOptions, type To } from "react-router-dom";
import { preloadRouteModule } from "../routes/lazyPages";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => void;
};

export function runViewTransition(callback: () => void) {
  if (typeof document === "undefined") {
    callback();
    return;
  }

  const doc = document as DocumentWithViewTransition;
  if (!doc.startViewTransition) {
    callback();
    return;
  }

  doc.startViewTransition(() => {
    flushSync(callback);
  });
}

export function useViewTransitionNavigate() {
  const navigate = useNavigate();

  return async (to: To, options?: NavigateOptions) => {
    try {
      await preloadRouteModule(to);
    } catch {
      // Ignore preload failures and keep navigation available.
    }

    runViewTransition(() => {
      navigate(to, options);
    });
  };
}
