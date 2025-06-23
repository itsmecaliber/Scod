import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import {store} from './redux/store.js';
import { Provider } from "react-redux";

const GOOGLE_CLIENT_ID = "805630464128-drtbtpnkg161hmjt6pggc8qvecqleo15.apps.googleusercontent.com"; // Replace with actual Client ID

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
      <App />
    </Provider>
);
