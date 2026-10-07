import { useState } from "react";
import { Map } from "./app-components/map.jsx";
import { SidePanel } from "./app-components/side-panel/side-panel.jsx";
import { QueryToolbar } from "./app-components/toolbar/query-toolbar.jsx";
import { ConsentBanner } from "./app-components/consent-banner.jsx";
import { DownloaderPage } from "./app-components/downloader-page.jsx";
import { SiteWrapper } from "@usace/groundwork";

// Session-scoped on purpose: the warning re-appears in every new tab or browser
// session, but acknowledging survives reloads of the same tab.
const CONSENT_KEY = "nsi-consent-acknowledged";

function hasAcknowledged() {
  try {
    return sessionStorage.getItem(CONSENT_KEY) === "true";
  } catch {
    return false;
  }
}

function App() {
  const [acknowledged, setAcknowledged] = useState(hasAcknowledged);

  const acknowledge = () => {
    try {
      sessionStorage.setItem(CONSENT_KEY, "true");
    } catch {
      // Still acknowledge for this page load; the warning just returns next time.
    }
    setAcknowledged(true);
  };

  return (
    <SiteWrapper
      fluidNav={true}
      showFooter={false}
      subtitle="NSI Downloader Tool"
      usaBanner={true}
      msgBanner={false}
      missionText="To facilitate simplified user access to structure inventory data nation-wide."
    >
      {acknowledged ? (
        <DownloaderPage />
      ) : (
        <ConsentBanner onAcknowledge={acknowledge} />
      )}
    </SiteWrapper>
  );
}

export default App;
