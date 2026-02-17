import React from "react";
import ReactDOM from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx"
import "./styles/style.css"
import "./styles/view-transitions.css"
import { Gallery, Home, Journal, PostPage } from "./routes/lazyPages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {index: true, element: <Home />},
      {path: "gallery", element: <Gallery />},
      {path: "journal", element: <Journal />},
      {path: "journal/contents/:slug", element: <PostPage />}
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
