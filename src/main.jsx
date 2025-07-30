import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import createStore from "./app-bundles/index.js";
import { ReduxBundlerProvider } from "redux-bundler-hook";
import cache from "./cache.js";
import "./styles/index.css";
import App from "./App.jsx";

cache.getAll().then((data) => {
  const store = createStore(data);
  if (import.meta.env.DEV) window.store = store;

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ReduxBundlerProvider store={store}>
        <App />
      </ReduxBundlerProvider>
    </StrictMode>
  );
});
