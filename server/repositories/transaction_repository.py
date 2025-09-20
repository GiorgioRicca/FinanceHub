

from typing import List, Optional
from decimal import Decimal
from datetime import datetime, timedelta
from models.transaction import Transaction
from .base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    """
    Repository per la gestione delle transazioni finanziarie.
    Implementa analisi di spese mensili, ricavi e variazioni temporali.
    Gestisce ricerche per categoria, periodo e calcoli di trend finanziari.
    """
    
    
    def find_by_account_id(self, account_id: str, limit: Optional[int] = None) -> List[Transaction]:
        
        transactions = [txn for txn in self._data.values() if txn.account_id == account_id]
        
        transactions.sort(key=lambda x: x.transaction_date, reverse=True)
        if limit:
            transactions = transactions[:limit]
        return transactions
    
    def find_by_user_accounts(self, account_ids: List[str], limit: Optional[int] = None) -> List[Transaction]:
        
        transactions = [
            txn for txn in self._data.values() 
            if txn.account_id in account_ids
        ]
        
        transactions.sort(key=lambda x: x.transaction_date, reverse=True)
        if limit:
            transactions = transactions[:limit]
        return transactions
    
    def find_by_category(self, account_id: str, category: str) -> List[Transaction]:
        
        return [
            txn for txn in self._data.values() 
            if txn.account_id == account_id and txn.category == category
        ]
    
    def find_by_date_range(self, account_id: str, start_date: datetime, end_date: datetime) -> List[Transaction]:
        
        return [
            txn for txn in self._data.values()
            if txn.account_id == account_id and start_date <= txn.transaction_date <= end_date
        ]
    
    def get_monthly_expenses(self, account_ids: List[str]) -> Decimal:
        
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = (current_month.replace(day=28) + timedelta(days=4)).replace(day=1)
        
        monthly_transactions = [
            txn for txn in self._data.values()
            if txn.account_id in account_ids and 
            current_month <= txn.transaction_date < next_month and
            txn.amount < 0  
        ]
        
        return abs(sum(txn.amount for txn in monthly_transactions))
    
    def get_monthly_income(self, account_ids: List[str]) -> Decimal:
        
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = (current_month.replace(day=28) + timedelta(days=4)).replace(day=1)
        
        monthly_transactions = [
            txn for txn in self._data.values()
            if txn.account_id in account_ids and 
            current_month <= txn.transaction_date < next_month and
            txn.amount > 0  
        ]
        
        return sum(txn.amount for txn in monthly_transactions)
    
    def get_expense_variation(self, account_ids: List[str]) -> float:
        
        current_month = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        previous_month = (current_month - timedelta(days=1)).replace(day=1)
        
        
        current_expenses = self.get_monthly_expenses(account_ids)
        
        
        previous_month_txns = [
            txn for txn in self._data.values()
            if txn.account_id in account_ids and 
            previous_month <= txn.transaction_date < current_month and
            txn.amount < 0
        ]
        previous_expenses = abs(sum(txn.amount for txn in previous_month_txns))
        
        if previous_expenses == 0:
            return 0.0 if current_expenses == 0 else 100.0
        
        variation = ((current_expenses - previous_expenses) / previous_expenses) * 100
        return float(variation)