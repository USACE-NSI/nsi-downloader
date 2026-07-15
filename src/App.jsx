import { useEffect, useState } from "react";
import { Map } from "./app-components/map.jsx";
import { SidePanel } from "./app-components/side-panel/side-panel.jsx";
import { QueryToolbar } from "./app-components/toolbar/query-toolbar.jsx";
import { DownloaderPage } from "./app-components/downloader-page.jsx";
import { SiteWrapper } from "@usace/groundwork";

function App() {
  return (
    <SiteWrapper fluidNav showFooter={false} subtitle="NSI Downloader Tool">
      <DownloaderPage />
    </SiteWrapper>
  );
}

export default App;
