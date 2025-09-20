

from typing import List, Optional
from models.user import User
from .base import BaseRepository


class UserRepository(BaseRepository[User]):
    """
    Repository per la gestione degli utenti del sistema.
    Implementa operazioni di autenticazione e ricerca per credenziali.
    Gestisce validazione di unicità per username ed email.
    """
    
    
    def find_by_username(self, username: str) -> Optional[User]:
        
        for user in self._data.values():
            if user.username == username:
                return user
        return None
    
    def find_by_email(self, email: str) -> Optional[User]:
        
        for user in self._data.values():
            if user.email == email:
                return user
        return None
    
    def username_exists(self, username: str) -> bool:
        
        return self.find_by_username(username) is not None
    
    def email_exists(self, email: str) -> bool:
        
        return self.find_by_email(email) is not None