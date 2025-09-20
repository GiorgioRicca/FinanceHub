import NotificationPanel from "./notification-panel";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

/**
 * Componente Header per le pagine con titolo, sottotitolo e notifiche.
 * Mostra la data corrente e integra il pannello notifiche.
 * Fornisce layout consistente per tutte le pagine dell'applicazione.
 */
export default function Header({ title, subtitle }: HeaderProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{title}</h1>
          {subtitle && (
            <p className="text-neutral-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <NotificationPanel />
          <div className="text-sm text-neutral-500">
            Today: {currentDate}
          </div>
        </div>
      </div>
    </header>
  );
}
