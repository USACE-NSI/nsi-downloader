import { useEffect } from "react";
import { useConnect } from "redux-bundler-hook";
import { Button } from "@usace/groundwork";
import { MdErrorOutline } from "react-icons/md";

// Groundwork's Modal is not used here: it hardcodes 48px panel padding and a
// centered title, which strands a short error message in whitespace. This is
// the same card styling as the side panel sections.
export function ErrorModal() {
  const { nsiLoadError, doNsiDismissError } = useConnect(
    "selectNsiLoadError",
    "doNsiDismissError",
  );

  useEffect(() => {
    if (!nsiLoadError) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") doNsiDismissError();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nsiLoadError, doNsiDismissError]);

  if (!nsiLoadError) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 p-4"
      onClick={doNsiDismissError}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="error-title"
        // The backdrop closes on click, so keep clicks inside the card from
        // bubbling up to it.
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-3 w-full max-w-sm p-4 rounded-md bg-white border border-gray-300 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <MdErrorOutline className="shrink-0 text-red-600" size={18} />
          <span id="error-title" className="text-sm font-semibold text-gray-900">
            Query failed
          </span>
        </div>
        <p className="text-sm text-gray-700">{nsiLoadError}</p>
        <div className="flex justify-end">
          <Button color="blue" onClick={doNsiDismissError} autoFocus>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
