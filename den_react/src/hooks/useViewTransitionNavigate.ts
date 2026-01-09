import { flushSync } from "react-dom";
import { useNavigate, type NavigateOptions, type To } from "react-router-dom";

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

  return (to: To, options?: NavigateOptions) => {
    runViewTransition(() => {
      navigate(to, options);
    });
  };
}
