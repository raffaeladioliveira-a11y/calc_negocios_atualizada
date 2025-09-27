import { ReactNode } from "react";
import { Outlet } from "react-router-dom"; // Adicionar este import
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children?: ReactNode; // Tornar opcional
  title?: string;
  onSearch?: (query: string) => void;
}

export function Layout({ children, title, onSearch }: LayoutProps) {
  return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <Sidebar />

          <div className="flex-1 flex flex-col">
            <Header title={title} onSearch={onSearch} />

            <main className="flex-1 overflow-auto">
              <div className="p-6 ml-64">
                {children || <Outlet />} {/* Usar Outlet quando não há children */}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
  );
}