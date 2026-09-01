import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AboutCreditFix } from "./components/AboutCreditFix";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <AboutCreditFix />
  </React.StrictMode>,
);
