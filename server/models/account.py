

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Literal


AccountType = Literal['checking', 'savings', 'investment', 'loan']


@dataclass
class Account:
    """
    Rappresenta un conto bancario o finanziario dell'utente.
    Gestisce le informazioni base del conto inclusi saldo, tipo e numerazione.
    Supporta diversi tipi di conto: corrente, risparmio, investimenti e prestiti.
    """
    
    id: str
    user_id: str
    name: str
    type: AccountType
    balance: Decimal
    account_number: str
    created_at: datetime
    updated_at: datetime

    def __post_init__(self):
        
        if not self.user_id:
            raise ValueError("User ID is required")
        if not self.name:
            raise ValueError("Account name is required")
        if self.type not in ['checking', 'savings', 'investment', 'loan']:
            raise ValueError("Invalid account type")