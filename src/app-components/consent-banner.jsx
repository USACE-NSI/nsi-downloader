import { Button } from "@usace/groundwork";

// Startup gate for the USG Information System warning: App.jsx renders this in
// place of DownloaderPage, so the map and any NSI queries stay unmounted until
// the user acknowledges.
export function ConsentBanner({ onAcknowledge }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-5">
        {/* No Escape key or backdrop handler: acknowledging is the only way out. */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-title"
          className="w-full max-w-2xl rounded-xl border border-gray-300 bg-[#f9f9f9] p-5"
        >
          <h2
            id="consent-title"
            className="mb-3 text-lg font-semibold text-gray-900"
          >
            NSI Downloader Tool
          </h2>
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-gray-700">
            <p>
              You are accessing a U.S. Government (USG) Information System (IS)
              that is provided for USG-authorized use only.
            </p>
            <p>
              By using this IS (which includes any device attached to this IS),
              you consent to the following conditions:
            </p>
            <ul className="flex flex-col gap-2 pl-6 list-disc">
              <li>
                The USG routinely intercepts and monitors communications on this
                IS for purposes including, but not limited to, penetration
                testing, COMSEC monitoring, network operations and defense,
                personnel misconduct (PM), law enforcement (LE), and
                counterintelligence (CI) investigations.
              </li>
              <li>
                At any time, the USG may inspect and seize data stored on this
                IS.
              </li>
              <li>
                Communications using, or data stored on, this IS are not
                private, are subject to routine monitoring, interception, and
                search, and may be disclosed or used for any USG-authorized
                purpose.
              </li>
              <li>
                This IS includes security measures (e.g., authentication and
                access controls) to protect USG interests—not for your personal
                benefit or privacy.
              </li>
              <li>
                Notwithstanding the above, using this IS does not constitute
                consent to PM, LE or CI investigative searching or monitoring of
                the content of privileged communications, or work product,
                related to personal representation or services by attorneys,
                psychotherapists, or clergy, and their assistants. Such
                communications and work product are private and confidential.
                See User Agreement for details.
              </li>
            </ul>
          </div>
          <div className="mt-5 flex justify-end">
            <Button color="blue" onClick={onAcknowledge} autoFocus>
              Acknowledge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
