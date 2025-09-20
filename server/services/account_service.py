

from typing import List, Optional
from decimal import Decimal
from models.account import Account, AccountType
from repositories.account_repository import AccountRepository


class AccountService:
    """
    Servizio per la gestione dei conti bancari e finanziari.
    Implementa logica di business per creazione conti e validazioni.
    Coordina con repository e servizio notifiche per operazioni complete.
    """
    
    
    def __init__(self, 
                 account_repository: AccountRepository,
                 notification_service):
        self.account_repository = account_repository
        self.notification_service = notification_service
    
    def create_account(self, user_id: str, name: str, account_type: AccountType,
                      initial_balance: Decimal = Decimal('0.00')) -> Account:
        
        
        if initial_balance < 0 and account_type != 'loan':
            raise ValueError("Initial balance cannot be negative for non-loan accounts")
        
        account = self.account_repository.create_account(
            user_id=user_id,
            name=name,
            account_type=account_type,
            initial_balance=initial_balance
        )
        
        
        self.notification_service.create_notification(
            user_id=user_id,
            title="Nuovo Conto Creato",
            message=f"Il conto '{name}' è stato creato con successo",
            notification_type="success"
        )
        
        return account
    
    def get_user_accounts(self, user_id: str) -> List[Account]:
        
        return self.account_repository.find_by_user_id(user_id)
    


    
