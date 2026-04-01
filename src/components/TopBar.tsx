import { LogOut, Zap, History, BarChart2, UserCircle, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Logo = () => (
  <svg width="140" height="34" viewBox="0 0 180 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        d="M5 30 C11 26, 17 34, 23 30 C29 26, 35 34, 41 30 L41 37 C35 41, 29 33, 23 37 C17 41, 11 33, 5 37 Z"
        fill="hsl(var(--primary))"
      />
      <path
        d="M3 21 C9 17, 16 25, 23 21 C30 17, 37 25, 43 21 L43 28 C37 32, 30 24, 23 28 C16 32, 9 24, 3 28 Z"
        fill="hsl(var(--primary) / 0.6)"
      />
      <path
        d="M1 13 C8 9, 16 17, 23 13 C30 9, 38 17, 45 13 L45 20 C38 24, 30 16, 23 20 C16 24, 8 16, 1 20 Z"
        fill="hsl(var(--primary) / 0.2)"
      />
    </g>
    <text x="54" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="21" fontWeight="400">
      <tspan fill="hsl(var(--foreground))">Content</tspan><tspan fill="hsl(var(--primary))">Flow</tspan>
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
  const location = useLocation();
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "CF";

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const navItem = (path: string, icon: React.ReactNode, label: string) => {
    const active = location.pathname === path;
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(path)}
        className={`gap-1.5 transition-colors ${
          active
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </Button>
    );
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-2.5 backdrop-blur-md md:px-8">
      {/* Logo → Landing Page */}
      <Link
        to="/"
        className="flex items-center opacity-90 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
        aria-label="Ir para a página inicial"
      >
        <Logo />
      </Link>

      <div className="flex items-center gap-1">
        {user && (
          <>
            {/* Plan badge */}
            {planInfo?.plan && planInfo.plan !== "free" && (
              <button
                onClick={onUpgrade}
                className="mr-2 hidden sm:flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 capitalize transition-colors"
              >
                <Zap className="h-3 w-3 fill-primary" /> {planInfo.plan}
              </button>
            )}

            {isAdmin && navItem('/admin', <BarChart2 className="h-4 w-4" />, 'Admin')}
            {navItem('/perfil', <UserCircle className="h-4 w-4" />, 'Perfil')}
            {navItem('/calendario', <CalendarDays className="h-4 w-4" />, 'Calendario')}
            {navItem('/compliance', <ShieldCheck className="h-4 w-4" />, 'Compliance')}
            {navItem('/history', <History className="h-4 w-4" />, 'Historico')}

            <div className="mx-1 h-5 w-px bg-border/60" />

            {/* Email — hidden on mobile */}
            <span className="hidden text-xs text-muted-foreground lg:block mr-1">{user.email}</span>

            {/* Avatar → perfil */}
            <button
              onClick={() => navigate('/perfil')}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors ring-1 ring-primary/20"
              title="Meu perfil"
              aria-label="Acessar perfil"
            >
              {initials}
            </button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive ml-0.5"
              onClick={signOut}
              title="Sair"
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default TopBar;
