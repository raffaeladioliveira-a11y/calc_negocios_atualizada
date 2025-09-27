import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Building2,
    Users,
    Headset,
    HandCoins,
    KeyRound,
    Calculator,
    FileText,
    Settings,
    Menu,
    X,
    LogOut,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import PermissionGuard from '@/components/ProtectedRoute/PermissionGuard';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Navegação com permissões associadas
const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    permission: "dashboard.browse"
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Headset,
    permission: "clientes.browse"
  },
  {
    name: "Config Valores",
    href: "/configuracao-valores",
    icon: Settings,
    permission: "configuracao-valores.browse"
  },
  {
    name: "Calculadora",
    href: "/calculadora",
    icon: Calculator,
    permission: "calculadora.browse"
  },
  {
    name: "Orçamentos",
    href: "/orcamentos",
    icon: HandCoins,
    permission: "orcamentos.browse"
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: FileText,
    permission: "relatorios.browse"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    permission: "analytics.browse" // Você pode criar essa permissão ou usar outra existente
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    permission: "config.browse"
  }
];

// Navegação administrativa (separada para melhor organização)
const adminNavigation = [
  {
    name: "Usuários",
    href: "/admin/users",
    icon: Users,
    permission: "users.browse"
  },
  {
    name: "Papéis",
    href: "/admin/roles",
    icon: KeyRound,
    permission: "roles.browse"
  }
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
      <>
      {/* Mobile backdrop */}
      {isOpen && (
          <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
          />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "glass-card border-r border-glass-border"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-glass-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">Calc Negócios</h1>
            </div>
            <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-2 rounded-lg glass-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Menu Principal */}
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                  <PermissionGuard key={item.name} permission={item.permission}>
                    <Link
                        to={item.href}
                        className={cn(
                      "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "gradient-primary text-primary-foreground shadow-primary"
                        : "glass-button hover:shadow-glass"
                    )}
                        onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </PermissionGuard>
              );
            })}

            {/* Seção Administrativa - só mostra se tiver pelo menos uma permissão admin */}
            <PermissionGuard permissions={['users.browse', 'roles.browse']}>
              <div className="pt-4 mt-4 border-t border-glass-border">
                <div className="px-3 pb-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Administração
                  </p>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                      <PermissionGuard key={item.name} permission={item.permission}>
                        <Link
                            to={item.href}
                            className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                          isActive
                            ? "gradient-primary text-primary-foreground shadow-primary"
                            : "glass-button hover:shadow-glass"
                        )}
                            onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </PermissionGuard>
                  );
                })}
              </div>
            </PermissionGuard>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-glass-border">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{user?.name || 'Usuário'}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user?.email || 'usuario@calcnegocios.com'}
                  </p>
                </div>
              </div>
              <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 glass-button px-4 py-2 rounded-lg hover:shadow-glass transition-shadow"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
      </>
  );
}