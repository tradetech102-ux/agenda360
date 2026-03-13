import { useState, useEffect } from "react";
import { Bell, X, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Queries
  const { data: notifications, refetch } = trpc.notifications.list.useQuery();
  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery();
  
  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Auto-refetch notifications every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  const unreadNotifications = notifications?.filter(n => !n.read) || [];
  const readNotifications = notifications?.filter(n => n.read) || [];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "bg-blue-500/10 border-blue-500/20 text-blue-500";
      case "task_due":
        return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
      case "task_completed":
        return "bg-green-500/10 border-green-500/20 text-green-500";
      case "message":
        return "bg-purple-500/10 border-purple-500/20 text-purple-500";
      case "team_invite":
        return "bg-pink-500/10 border-pink-500/20 text-pink-500";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-500";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "📋";
      case "task_due":
        return "⏰";
      case "task_completed":
        return "✅";
      case "message":
        return "💬";
      case "team_invite":
        return "👥";
      default:
        return "🔔";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg hover:bg-accent transition-colors"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount && unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-sm font-semibold">Notificações</h2>
          <span className="text-xs text-muted-foreground">
            {unreadCount} não lidas
          </span>
        </div>

        {/* Content */}
        <ScrollArea className="h-96">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {/* Unread Notifications */}
              {unreadNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-accent/50 text-xs font-semibold text-muted-foreground sticky top-0">
                    Não lidas ({unreadNotifications.length})
                  </div>
                  {unreadNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 border-l-purple-500 bg-purple-500/5 hover:bg-purple-500/10 transition-colors cursor-pointer group`}
                      onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-1">
                          {getNotificationIcon(notification.notificationType)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate({ id: notification.id });
                          }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Read Notifications */}
              {readNotifications.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-accent/30 text-xs font-semibold text-muted-foreground sticky top-0">
                    Lidas ({readNotifications.length})
                  </div>
                  {readNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-1">
                          {getNotificationIcon(notification.notificationType)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação no momento
              </p>
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
