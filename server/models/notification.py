

from dataclasses import dataclass
from datetime import datetime
from typing import Literal


NotificationType = Literal['info', 'success', 'warning', 'error']


@dataclass
class Notification:
    """
    Rappresenta una notifica del sistema per l'utente.
    Gestisce messaggi informativi, successi, avvisi ed errori.
    Traccia lo stato di lettura e fornisce metodi per marcare come lette.
    """
    
    id: str
    user_id: str
    title: str
    message: str
    notification_type: NotificationType
    read: bool
    created_at: datetime
    read_at: datetime = None

    def __post_init__(self):
        
        if not self.user_id:
            raise ValueError("User ID is required")
        if not self.title:
            raise ValueError("Title is required")
        if not self.message:
            raise ValueError("Message is required")
        if self.notification_type not in ['info', 'success', 'warning', 'error']:
            raise ValueError("Invalid notification type")

    def mark_as_read(self):
        
        self.read = True
        self.read_at = datetime.now()

    @property
    def is_unread(self) -> bool:
        
        return not self.read