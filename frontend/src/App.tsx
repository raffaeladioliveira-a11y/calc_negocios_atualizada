import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Empresas from "./pages/Empresas";
import Clientes from "./pages/Clientes";
import Calculadora from "./pages/Calculadora";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";
import ConfiguracaoValores from "./pages/ConfiguracaoValores";
import Orcamentos from "./pages/Orcamentos";
import AdminUsers from "./pages/AdminUsers";
import AdminRoles from "./pages/AdminRoles";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import AdminPermissions from "./pages/AdminPermissions";



const queryClient = new QueryClient();

// Componente de debug para mostrar informações
const DebugInfo = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
        <div>Rota: {location.pathname}</div>
        <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>User: {user?.name || 'null'}</div>
      </div>
  );
};

// Componente interno para verificar autenticação
const AppRoutes = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Loading enquanto verifica autenticação
  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
          </div>
        </div>
    );
  }

  return (
      <>
      <Routes>
        {/* Rota pública de login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas */}
        {isAuthenticated ? (
            <>

            <Route path="/" element={<Layout />}>
              <Route index element={
        <ProtectedRoute requiredPermission="dashboard.browse">
          <Dashboard />
        </ProtectedRoute>
      } />


              <Route path="clientes" element={
        <ProtectedRoute requiredPermission="clientes.browse">
          <Clientes />
        </ProtectedRoute>
      } />

              <Route path="calculadora" element={
        <ProtectedRoute requiredPermission="calculadora.browse">
          <Calculadora />
        </ProtectedRoute>
      } />

              <Route path="configuracao-valores" element={
        <ProtectedRoute requiredPermission="configuracao-valores.browse">
          <ConfiguracaoValores />
        </ProtectedRoute>
      } />

              <Route path="orcamentos" element={
        <ProtectedRoute requiredPermission="orcamentos.browse">
          <Orcamentos />
        </ProtectedRoute>
      } />

              <Route path="relatorios" element={
        <ProtectedRoute requiredPermission="relatorios.browse">
          <Relatorios />
        </ProtectedRoute>
      } />

              <Route path="admin/users" element={
        <ProtectedRoute requiredPermission="users.browse">
          <AdminUsers />
        </ProtectedRoute>
      } />

              <Route path="admin/roles" element={
        <ProtectedRoute requiredPermission="roles.browse">
          <AdminRoles />
        </ProtectedRoute>
      } />
              <Route path="admin/permissions" element={
  <ProtectedRoute requiredPermission="permissions.browse">
    <AdminPermissions />
  </ProtectedRoute>
} />
            </Route>

            <Route path="*" element={<NotFound />} />
            </>
        ) : (
            <>
            {/* Se não autenticado e não está na rota de login, redirecionar */}
            {location.pathname !== '/login' && (
                <Route path="*" element={<Navigate to="/login" replace />} />
            )}
            </>
        )}
      </Routes>
      <DebugInfo />
      </>
  );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;