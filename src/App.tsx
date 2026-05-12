import { useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useStore } from "@/lib/store";
import api from "@/lib/api";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Generator from "./pages/Generator";
import Saved from "./pages/Saved";
import ContentDetail from "./pages/ContentDetail";
import Templates from "./pages/Templates";
import History from "./pages/History";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound.tsx";

const App = () => {
  const { user, setUser, setItems } = useStore();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (token && !user) {
      Promise.all([api.get("/user/profile"), api.get("/content")])
        .then(([{ data: profile }, { data: items }]) => {
          setUser(profile);
          setItems(
            items.map((it: any) => ({
              id: it.id,
              productName: it.productName,
              category: it.category,
              tone: it.tone,
              language: it.language,
              createdAt: new Date(it.createdAt).getTime(),
              input: it.inputJson,
              content: it.outputJson,
              saved: it.isSaved,
            })),
          );
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          setUser(null);
        });
    }
  }, [token, user, setUser, setItems]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app"
            element={token ? <AppLayout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="generate" element={<Generator />} />
            <Route path="saved" element={<Saved />} />
            <Route path="content/:id" element={<ContentDetail />} />
            <Route path="templates" element={<Templates />} />
            <Route path="history" element={<History />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="admin"
              element={
                user?.role === "ADMIN" ? <Admin /> : <Navigate to="/app" />
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
