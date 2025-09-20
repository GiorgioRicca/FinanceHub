

from typing import List, Optional
from datetime import datetime
from uuid import uuid4
from models.notification import Notification, NotificationType
from repositories.notification_repository import NotificationRepository


class NotificationService:
    """
    Servizio per la gestione delle notifiche del sistema.
    Implementa creazione, lettura e marcatura notifiche per utenti.
    Gestisce diversi tipi di notifica: info, successo, avviso ed errore.
    """
    
    
    def __init__(self, notification_repository: NotificationRepository):
        self.notification_repository = notification_repository
    
    def create_notification(self, user_id: str, title: str, message: str,
                           notification_type: NotificationType = "info") -> Notification:
        
        notification = Notification(
            id=str(uuid4()),
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            read=False,
            created_at=datetime.now()
        )
        
        return self.notification_repository.create(notification)
    
    def get_user_notifications(self, user_id: str, limit: Optional[int] = 50) -> List[Notification]:
        
        return self.notification_repository.find_by_user_id(user_id, limit)
    
    def get_unread_notifications(self, user_id: str) -> List[Notification]:
        
        return self.notification_repository.find_unread_by_user_id(user_id)
    
    def mark_as_read(self, notification_id: str, user_id: str) -> Optional[Notification]:
        
        notification = self.notification_repository.get_by_id(notification_id)
        if not notification or notification.user_id != user_id:
            raise ValueError("Notification not found or access denied")
        
        return self.notification_repository.mark_as_read(notification_id)
    
    def mark_all_as_read(self, user_id: str) -> int:
        
        return self.notification_repository.mark_all_as_read(user_id)
