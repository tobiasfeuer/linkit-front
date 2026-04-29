import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import "./i18.ts";
import { HelmetProvider } from "react-helmet-async";

const persistor = persistStore(store);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <BrowserRouter>
      <HelmetProvider>
        <App />
      </HelmetProvider>
      </BrowserRouter>
    </Provider>
  </PersistGate>
);
