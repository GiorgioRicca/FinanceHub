import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { Bell, X, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

const DEMO_USER_ID = "demo-user-123";

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);

  
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", DEMO_USER_ID],
    refetchInterval: isOpen ? 5000 : 15000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  
  const { data: unreadNotifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", DEMO_USER_ID, "unread"],
    refetchInterval: isOpen ? 5000 : 15000, 
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest("PATCH", `/api/notifications/${notificationId}/read`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loan-workflow"] });
    }
  });

  
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PATCH", `/api/notifications/${DEMO_USER_ID}/read-all`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (notification.read === 0) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadNotifications.length > 0) {
      markAllAsReadMutation.mutate();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "loan_approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "loan_rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "loan_approved":
        return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20";
      case "loan_rejected":
        return "border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20";
      default:
        return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadNotifications.length > 9 ? "9+" : unreadNotifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifiche</CardTitle>
              <div className="flex items-center gap-2">
                {unreadNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={markAllAsReadMutation.isPending}
                    className="text-xs"
                  >
                    Segna tutte come lette
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Separator />
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Caricamento notifiche...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nessuna notifica</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        notification.read === 0 ? getNotificationStyle(notification.type) : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              notification.read === 0 ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {notification.title}
                            </h4>
                            {notification.read === 0 && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          
                          <p className={`text-sm mb-2 ${
                            notification.read === 0 ? "text-foreground/80" : "text-muted-foreground"
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: it
                              })}
                            </span>
                            
                            {notification.data && (
                              <Badge variant="outline" className="text-xs">
                                {JSON.parse(notification.data).type || "Info"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="p-3 text-center">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    Visualizza tutte le notifiche
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}