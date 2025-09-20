

from typing import List, Optional
from models.notification import Notification, NotificationType
from .base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """
    Repository per la gestione delle notifiche del sistema.
    Implementa operazioni per notifiche non lette e marcatura come lette.
    Gestisce pulizia automatica di notifiche vecchie e conteggi.
    """
    
    
    def find_by_user_id(self, user_id: str, limit: Optional[int] = None) -> List[Notification]:
        
        notifications = [
            notif for notif in self._data.values() 
            if notif.user_id == user_id
        ]
        
        notifications.sort(key=lambda x: x.created_at, reverse=True)
        if limit:
            notifications = notifications[:limit]
        return notifications
    
    def find_unread_by_user_id(self, user_id: str) -> List[Notification]:
        
        return [
            notif for notif in self._data.values() 
            if notif.user_id == user_id and not notif.read
        ]
    
    def find_by_type(self, user_id: str, notification_type: NotificationType) -> List[Notification]:
        
        return [
            notif for notif in self._data.values()
            if notif.user_id == user_id and notif.notification_type == notification_type
        ]
    
    def mark_as_read(self, notification_id: str) -> Optional[Notification]:
        
        notification = self.get_by_id(notification_id)
        if notification:
            notification.mark_as_read()
            return notification
        return None
    
    def mark_all_as_read(self, user_id: str) -> int:
        
        count = 0
        for notification in self._data.values():
            if notification.user_id == user_id and not notification.read:
                notification.mark_as_read()
                count += 1
        return count
    
    def get_unread_count(self, user_id: str) -> int:
        
        return len(self.find_unread_by_user_id(user_id))
    
    def delete_old_notifications(self, user_id: str, days: int = 30) -> int:
        
        from datetime import datetime, timedelta
        
        cutoff_date = datetime.now() - timedelta(days=days)
        to_delete = []
        
        for notification in self._data.values():
            if (notification.user_id == user_id and 
                notification.created_at < cutoff_date and 
                notification.read):
                to_delete.append(notification.id)
        
        for notif_id in to_delete:
            self.delete(notif_id)
        
        return len(to_delete)