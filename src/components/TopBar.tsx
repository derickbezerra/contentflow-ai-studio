import { LogOut, Zap, History, BarChart2, UserCircle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Logo = () => (
  <svg width="180" height="44" viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        d="M5 30 C11 26, 17 34, 23 30 C29 26, 35 34, 41 30 L41 37 C35 41, 29 33, 23 37 C17 41, 11 33, 5 37 Z"
        fill="#3d6b52"
      />
      <path
        d="M3 21 C9 17, 16 25, 23 21 C30 17, 37 25, 43 21 L43 28 C37 32, 30 24, 23 28 C16 32, 9 24, 3 28 Z"
        fill="#5a8a6a"
      />
      <path
        d="M1 13 C8 9, 16 17, 23 13 C30 9, 38 17, 45 13 L45 20 C38 24, 30 16, 23 20 C16 24, 8 16, 1 20 Z"
        fill="#c8ddd0"
      />
    </g>
    <text x="54" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="21" fontWeight="400">
      <tspan fill="#1a2e23">Content</tspan><tspan fill="#6b9e7e">Flow</tspan>
    </text>
  </svg>
);

interface TopBarProps {
  onUpgrade?: () => void
}

const TopBar = ({ onUpgrade }: TopBarProps) => {
  const { user, signOut } = useAuth();
  const { planInfo } = usePlan();
  const navigate = useNavigate();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "CF";

  async function handleManagePlan() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/customer-portal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Não foi possível abrir o portal de assinatura.");
      }
    } catch {
      toast.error("Erro ao acessar portal de assinatura.");
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-10">
      <div className="flex items-center">
        <Logo />
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="hidden text-xs text-muted-foreground sm:block">{user.email}</span>

            {/* Plan badge — opens upgrade modal */}
            {planInfo?.plan !== "free" && planInfo?.plan != null ? (
              <button
                onClick={onUpgrade}
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 capitalize transition-colors"
              >
                <Zap className="h-3 w-3 fill-primary" /> {planInfo?.plan}
              </button>
            ) : null}

            {user?.email === 'bezerra@belvy.com.br' && (
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate('/admin')}>
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/perfil")}>
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/calendario")}>
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/history")}>
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
        {/* Avatar — opens Stripe customer portal */}
        <button
          onClick={user ? handleManagePlan : undefined}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
          title="Gerenciar assinatura"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};

export default TopBar;
