import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";
import { Toaster } from "sonner";
import "./i18n";
import MetaPixelTracker from "./MetaPixelTracker";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <MetaPixelTracker />
    <Provider store={store}>
      <App />
      <Toaster richColors position="top-center" />
    </Provider>
  </BrowserRouter>,
);
