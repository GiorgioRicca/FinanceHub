import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  CreditCard,
  HelpCircle
} from "lucide-react";

export default function Settings() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impostazioni</h1>
          <p className="text-gray-600">Gestisci le tue preferenze e configurazioni dell'account</p>
        </div>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informazioni Account
          </CardTitle>
          <CardDescription>
            Gestisci i dettagli del tuo profilo utente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input 
                id="name" 
                defaultValue="Demo User" 
                placeholder="Il tuo nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue="demo@finacehub.com" 
                placeholder="La tua email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Numero di telefono</Label>
            <Input 
              id="phone" 
              defaultValue="+39 123 456 7890" 
              placeholder="Il tuo numero di telefono"
            />
          </div>
          <Button>Salva modifiche</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifiche
          </CardTitle>
          <CardDescription>
            Controlla come e quando ricevere le notifiche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notifiche email</Label>
              <p className="text-sm text-gray-600">Ricevi aggiornamenti via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Avvisi transazioni</Label>
              <p className="text-sm text-gray-600">Notifiche per ogni transazione</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promemoria investimenti</Label>
              <p className="text-sm text-gray-600">Suggerimenti per ottimizzazioni del portafoglio</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alert prestiti</Label>
              <p className="text-sm text-gray-600">Notifiche per scadenze e pagamenti</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicurezza
          </CardTitle>
          <CardDescription>
            Mantieni il tuo account sicuro e protetto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Autenticazione a due fattori</Label>
              <p className="text-sm text-gray-600">Aggiungi un livello extra di sicurezza</p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Attiva
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sessioni attive</Label>
              <p className="text-sm text-gray-600">Gestisci i dispositivi connessi</p>
            </div>
            <Button variant="outline" size="sm">
              Visualizza
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cambia password</Label>
              <p className="text-sm text-gray-600">Aggiorna la password del tuo account</p>
            </div>
            <Button variant="outline" size="sm">
              Modifica
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Aspetto
          </CardTitle>
          <CardDescription>
            Personalizza l'interfaccia secondo le tue preferenze
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tema scuro</Label>
              <p className="text-sm text-gray-600">Usa il tema scuro per l'interfaccia</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lingua</Label>
              <p className="text-sm text-gray-600">Seleziona la lingua dell'interfaccia</p>
            </div>
            <Badge variant="secondary">
              Italiano
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Valuta predefinita</Label>
              <p className="text-sm text-gray-600">Valuta mostrata nell'interfaccia</p>
            </div>
            <Badge variant="secondary">
              EUR (€)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Privacy e Dati
          </CardTitle>
          <CardDescription>
            Controlla come utilizziamo i tuoi dati
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Condivisione dati analitici</Label>
              <p className="text-sm text-gray-600">Aiutaci a migliorare il servizio</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cookie marketing</Label>
              <p className="text-sm text-gray-600">Personalizza la tua esperienza pubblicitaria</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Scarica i tuoi dati</Label>
              <p className="text-sm text-gray-600">Ottieni una copia dei tuoi dati</p>
            </div>
            <Button variant="outline" size="sm">
              Richiedi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Supporto
          </CardTitle>
          <CardDescription>
            Ottieni aiuto e contatta il nostro team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-semibold">Centro assistenza</div>
              <div className="text-sm text-gray-600 mt-1">Guide e FAQ</div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-semibold">Contatta supporto</div>
              <div className="text-sm text-gray-600 mt-1">Chat dal vivo</div>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-semibold">Feedback</div>
              <div className="text-sm text-gray-600 mt-1">Suggerimenti</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}