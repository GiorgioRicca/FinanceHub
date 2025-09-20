

from typing import List, Optional
from decimal import Decimal
from models.loan import Loan, LoanType, LoanStatus
from .base import BaseRepository


class LoanRepository(BaseRepository[Loan]):
    """
    Repository per la gestione dei prestiti dell'utente.
    Implementa operazioni per prestiti attivi, calcoli di saldo e rate.
    Gestisce aggiornamenti di saldo residuo e transizioni di stato.
    """
    
    
    def find_by_user_id(self, user_id: str) -> List[Loan]:
        
        return [loan for loan in self._data.values() if loan.user_id == user_id]
    
    def find_by_status(self, user_id: str, status: LoanStatus) -> List[Loan]:
        
        return [
            loan for loan in self._data.values() 
            if loan.user_id == user_id and loan.status == status
        ]
    
    def find_active_loans(self, user_id: str) -> List[Loan]:
        
        return self.find_by_status(user_id, 'active')
    
    def find_by_type(self, user_id: str, loan_type: LoanType) -> List[Loan]:
        
        return [
            loan for loan in self._data.values() 
            if loan.user_id == user_id and loan.type == loan_type
        ]
    
    def get_total_remaining_balance(self, user_id: str) -> Decimal:
        
        active_loans = self.find_active_loans(user_id)
        return sum(loan.remaining_balance for loan in active_loans)
    
    def get_total_monthly_payments(self, user_id: str) -> Decimal:
        
        active_loans = self.find_active_loans(user_id)
        return sum(loan.monthly_payment for loan in active_loans)
    
    def update_remaining_balance(self, loan_id: str, new_balance: Decimal) -> Optional[Loan]:
        
        loan = self.get_by_id(loan_id)
        if loan:
            loan.remaining_balance = new_balance
            
            if new_balance <= 0:
                loan.status = 'paid_off'
                loan.remaining_balance = Decimal('0.00')
            from datetime import datetime
            loan.updated_at = datetime.now()
            return loan
        return None