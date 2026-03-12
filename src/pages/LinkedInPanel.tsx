import { Linkedin, ExternalLink } from 'lucide-react';

export default function LinkedInPanel() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">LinkedIn Panel</h1>
          <p className="text-muted-foreground mt-1">Manage your LinkedIn presence</p>
        </div>
      </div>

      <div className="card-gradient rounded-xl border border-border p-12 shadow-card text-center">
        <Linkedin className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-display font-semibold text-foreground mb-2">LinkedIn Integration</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          This panel will be used to manage your LinkedIn activities, posts, and engagement tracking.
        </p>
        <p className="text-sm text-muted-foreground">Coming soon — stay tuned for updates</p>
      </div>
    </div>
  );
}
