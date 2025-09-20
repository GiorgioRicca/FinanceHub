

from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
from uuid import uuid4
from models.transaction import Transaction
from repositories.transaction_repository import TransactionRepository
from repositories.account_repository import AccountRepository


class TransactionService:
    """
    Servizio per la gestione delle transazioni finanziarie.
    Implementa creazione transazioni con aggiornamento saldi conto.
    Gestisce notifiche per transazioni importanti e validazioni.
    """
    
    
    def __init__(self,
                 transaction_repository: TransactionRepository,
                 account_repository: AccountRepository,
                 notification_service):
        self.transaction_repository = transaction_repository
        self.account_repository = account_repository
        self.notification_service = notification_service
    
    def create_transaction(self, account_id: str, amount: Decimal, description: str,
                          category: str, user_id: str) -> Transaction:
        
        
        account = self.account_repository.get_by_id(account_id)
        if not account or account.user_id != user_id:
            raise ValueError("Account not found or access denied")
        
        
        transaction = Transaction(
            id=str(uuid4()),
            account_id=account_id,
            amount=amount,
            description=description,
            category=category,
            transaction_date=datetime.now(),
            created_at=datetime.now(),
            reference_number=f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        )
        
        created_transaction = self.transaction_repository.create(transaction)
        
        
        new_balance = account.balance + amount
        self.account_repository.update_balance(account_id, new_balance)
        
        
        if abs(amount) >= Decimal('1000'):
            notification_type = "success" if amount > 0 else "info"
            self.notification_service.create_notification(
                user_id=user_id,
                title="Transazione Importante",
                message=f"€{abs(amount):,.2f} - {description}",
                notification_type=notification_type
            )
        
        return created_transaction

    
    def get_user_recent_transactions(self, user_id: str, limit: int = 50) -> List[Transaction]:
        
        
        accounts = self.account_repository.find_by_user_id(user_id)
        account_ids = [acc.id for acc in accounts]
        
        if not account_ids:
            return []
        
        return self.transaction_repository.find_by_user_accounts(account_ids, limit)

