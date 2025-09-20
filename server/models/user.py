

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class User:
    """
    Rappresenta un utente del sistema con credenziali e informazioni personali.
    Gestisce autenticazione e dati anagrafici dell'utente.
    Include validazione per username, email e altri campi obbligatori.
    """
    
    id: str
    username: str
    password: str  
    name: str
    email: str
    created_at: datetime
    updated_at: datetime

    def __post_init__(self):
        
        if not self.username:
            raise ValueError("Username is required")
        if not self.email:
            raise ValueError("Email is required")
        if '@' not in self.email:
            raise ValueError("Valid email is required")