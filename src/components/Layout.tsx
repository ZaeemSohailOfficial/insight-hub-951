import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Briefcase, Building2, Linkedin, Menu, X, LayoutDashboard, LogOut, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const navItems = [
  { path: '/', label: 'Clients', icon: Users },
  { path: '/employees', label: 'Employees', icon: Briefcase },
  { path: '/personal', label: 'Innovelous', icon: Building2 },
  { path: '/linkedin', label: 'LinkedIn', icon: Linkedin },
];

interface LayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export default function Layout({ children, onLogout }: LayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  const handleChangePassword = () => {
    const storedPass = localStorage.getItem('app_password') || 'innovelous24';
    if (currentPass !== storedPass) {
      setPassError('Current password is incorrect');
      setPassSuccess('');
      return;
    }
    if (newPass.length < 4) {
      setPassError('New password must be at least 4 characters');
      setPassSuccess('');
      return;
    }
    localStorage.setItem('app_password', newPass);
    setPassError('');
    setPassSuccess('Password changed successfully!');
    setCurrentPass('');
    setNewPass('');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Innovelous</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  active ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button onClick={() => { setPassOpen(true); setPassError(''); setPassSuccess(''); }}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <KeyRound className="w-4 h-4" /> Change Password
          </button>
          <button onClick={onLogout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-destructive hover:bg-sidebar-accent transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
          <p className="text-xs text-muted-foreground text-center pt-2">© 2024 Innovelous</p>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-background/80 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <div className="flex-1 lg:ml-64">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <button onClick={() => setMobileOpen(true)} className="text-foreground"><Menu className="w-6 h-6" /></button>
          <h1 className="font-display font-bold text-foreground">Innovelous</h1>
          <div className="w-6" />
        </header>
        <main className="p-4 md:p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>

      <Dialog open={passOpen} onOpenChange={setPassOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Change Password</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Current Password</Label><Input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} /></div>
            <div><Label>New Password</Label><Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} /></div>
            {passError && <p className="text-sm text-destructive">{passError}</p>}
            {passSuccess && <p className="text-sm text-accent">{passSuccess}</p>}
            <Button onClick={handleChangePassword} className="w-full">Update Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
