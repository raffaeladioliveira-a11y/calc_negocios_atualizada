/**
 * Created by rafaela on 27/09/25.
 */
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Calculator, Eye, EyeOff, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext"; // ← NOVA IMPORTAÇÃO

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("admin@sistema.com"); // ← MUDANÇA: email do sistema ACL
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // ← NOVO: usar AuthContext
    const { login, isAuthenticated, isLoading } = useAuth();

    // ← NOVO: redirecionar se já autenticado
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ← MUDANÇA: usar método real do AuthContext
            const success = await login(email, password);

            if (success) {
                // Toast já é mostrado no AuthContext, mas podemos personalizar
                toast({
                    title: "Login realizado com sucesso!",
                    description: "Bem-vindo ao Calc Negócios",
                });
            }
            // Se falhou, o erro já foi mostrado pelo AuthContext
        } catch (error) {
            console.error('Erro no login:', error);
            toast({
                title: "Erro no login",
                description: "Erro inesperado. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // ← NOVO: mostrar loading se AuthContext estiver carregando
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <Calculator className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Carregando...</p>
        </div>
        </div>
    );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
    <div className="absolute top-20 left-20 w-72 h-72 gradient-primary rounded-full blur-3xl opacity-20"></div>
    <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
    </div>

    <Card className="w-full max-w-md glass-card border-glass-border shadow-glass">
    <CardHeader className="text-center space-y-4 pb-8">
    <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-primary">
    <Calculator className="w-8 h-8 text-primary-foreground" />
    </div>
    <div>
        <h1 className="text-2xl font-bold">Calc Negócios</h1>
    <p className="text-muted-foreground">Entre na sua conta</p>
    </div>
    </CardHeader>

    <CardContent className="space-y-6">
    <form onSubmit={handleLogin} className="space-y-4">
    <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
        id="email"
    type="email"
    placeholder="admin@sistema.com" // ← MUDANÇA: placeholder do sistema
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="glass-card border-glass-border"
    required
    disabled={loading} // ← NOVO: desabilitar durante loading
    />
    </div>

    <div className="space-y-2">
    <Label htmlFor="password">Senha</Label>
    <div className="relative">
    <Input
        id="password"
    type={showPassword ? "text" : "password"}
    placeholder="admin123"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="glass-card border-glass-border pr-10"
    required
    disabled={loading} // ← NOVO: desabilitar durante loading
    />
    <Button
        type="button"
    variant="ghost"
    size="icon"
    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
    onClick={() => setShowPassword(!showPassword)}
    disabled={loading} // ← NOVO: desabilitar durante loading
    >
    {showPassword ? (
        <EyeOff className="w-4 h-4 text-muted-foreground" />
    ) : (
        <Eye className="w-4 h-4 text-muted-foreground" />
    )}
    </Button>
    </div>
    </div>

    <Button
        type="submit"
    className="w-full gradient-primary shadow-primary h-11"
    disabled={loading}
    >
    {loading ? "Entrando..." : "Entrar"}
    </Button>
    </form>

    <div className="text-center space-y-4">
    <p className="text-sm text-muted-foreground">
        {/* ← MUDANÇA: credenciais do sistema ACL */}
    Credenciais de teste: admin@sistema.com / admin123
    </p>

    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
    <Building2 className="w-4 h-4" />
        <span>Sistema de Cálculos Empresariais</span>
    </div>
    </div>
    </CardContent>
    </Card>
    </div>
    );
}