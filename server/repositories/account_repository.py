

from typing import List, Optional
from decimal import Decimal
from models.account import Account, AccountType
from .base import BaseRepository


class AccountRepository(BaseRepository[Account]):
    """
    Repository per la gestione dei conti bancari e finanziari.
    Implementa operazioni specifiche per conti: ricerca per utente, tipo e saldo.
    Gestisce la creazione automatica di numeri conto e calcoli di saldo totale.
    """
    
    
    def find_by_user_id(self, user_id: str) -> List[Account]:
        
        return [acc for acc in self._data.values() if acc.user_id == user_id]
    
    def find_by_type(self, user_id: str, account_type: AccountType) -> List[Account]:
        
        return [
            acc for acc in self._data.values() 
            if acc.user_id == user_id and acc.type == account_type
        ]
    
    def find_by_account_number(self, account_number: str) -> Optional[Account]:
        
        for account in self._data.values():
            if account.account_number == account_number:
                return account
        return None
    
    def get_total_balance_by_user(self, user_id: str, exclude_loan_accounts: bool = False) -> Decimal:
        
        accounts = self.find_by_user_id(user_id)
        if exclude_loan_accounts:
            accounts = [acc for acc in accounts if acc.type != 'loan']
        return sum(acc.balance for acc in accounts)
    
    def update_balance(self, account_id: str, new_balance: Decimal) -> Optional[Account]:
        
        account = self.get_by_id(account_id)
        if account:
            account.balance = new_balance
            account.updated_at = account.updated_at
            return account
        return None
    
    def create_account(self, user_id: str, name: str, account_type: AccountType, 
                      initial_balance: Decimal = Decimal('0.00')) -> Account:
        
        from datetime import datetime
        from uuid import uuid4
        import random
        
        
        account_number = f"IT{random.randint(10, 99)}{random.randint(100000, 999999)}"
        
        account = Account(
            id=str(uuid4()),
            user_id=user_id,
            name=name,
            type=account_type,
            balance=initial_balance,
            account_number=account_number,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return self.create(account)