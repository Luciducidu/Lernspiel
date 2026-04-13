import { useEffect, useRef } from "react";

export function useModalA11y<T extends HTMLElement>(onEscape?: () => void) {
  const initialFocusRef = useRef<T | null>(null);

  useEffect(() => {
    initialFocusRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscape?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEscape]);

  return initialFocusRef;
}
