

from typing import List, Optional
from datetime import datetime
from uuid import uuid4
from models.user import User
from repositories.user_repository import UserRepository


class UserService:
    """
    Servizio per la gestione degli utenti del sistema.
    Implementa registrazione utenti con validazione unicità credenziali.
    Gestisce autenticazione e recupero informazioni utente.
    """
    
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def create_user(self, username: str, password: str, name: str, email: str) -> User:
        
        
        if self.user_repository.username_exists(username):
            raise ValueError("Username already exists")
        
        
        if self.user_repository.email_exists(email):
            raise ValueError("Email already exists")
        
        
        user = User(
            id=str(uuid4()),
            username=username,
            password=password,
            name=name,
            email=email,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return self.user_repository.create(user)
    
    def get_user(self, user_id: str) -> Optional[User]:
        
        return self.user_repository.get_by_id(user_id)
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        
        return self.user_repository.find_by_username(username)
