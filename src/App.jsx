import { useEffect, useState } from "react";
import { Map } from "./app-components/map.jsx";
import { SidePanel } from "./app-components/side-panel/side-panel.jsx";
import { QueryToolbar } from "./app-components/toolbar/query-toolbar.jsx";
import { DownloaderPage } from "./app-components/downloader-page.jsx";
import { SiteWrapper } from "@usace/groundwork";

function App() {
  return (
    <SiteWrapper 
      fluidNav={true}
      showFooter={false}
      subtitle="NSI Downloader Tool"
      usaBanner={false}
      msgBanner={false}
      missionText="To facilitate simplified user access to structure inventory data nation-wide.">
      <DownloaderPage />
    </SiteWrapper>
  );
}

export default App;
