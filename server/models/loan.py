

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional


LoanType = Literal['personal', 'mortgage', 'auto', 'business']
LoanStatus = Literal['active', 'paid_off', 'defaulted', 'pending']
LoanApplicationStatus = Literal['pending', 'evaluating', 'approved', 'rejected', 'requires_documents']



@dataclass
class Loan:
    """
    Rappresenta un prestito attivo dell'utente con dettagli di rimborso.
    Calcola automaticamente rate mensili e traccia il saldo residuo.
    Supporta diversi tipi: personale, mutuo, auto e business con stati variabili.
    """
    
    id: str
    user_id: str
    type: LoanType
    amount: Decimal
    interest_rate: Decimal
    term_months: int
    monthly_payment: Decimal
    remaining_balance: Decimal
    status: LoanStatus
    created_at: datetime
    updated_at: datetime

    def __post_init__(self):
        # validazioni base
        if not self.user_id:
            raise ValueError("User ID is required")
        if self.type not in ['personal', 'mortgage', 'auto', 'business']:
            raise ValueError("Invalid loan type")
        if self.amount <= 0:
            raise ValueError("Loan amount must be positive")
        if self.interest_rate < 0:
            raise ValueError("Interest rate cannot be negative")
        if self.term_months <= 0:
            raise ValueError("Term months must be positive")

    @property
    def progress_percentage(self) -> float:
        # calcola percentuale di rimborso
        if self.amount == 0:
            return 100.0
        paid_so_far = self.amount - self.remaining_balance
        return float((paid_so_far / self.amount) * 100)

    @property
    def remaining_months(self) -> int:
        # stima mesi rimanenti
        if self.monthly_payment <= 0 or self.remaining_balance <= 0:
            return 0
        return int(self.remaining_balance / self.monthly_payment) + 1

@dataclass 
class LoanApplication:
    """Loan application domain entity."""
    id: str
    user_id: str
    type: LoanType
    amount: Decimal
    purpose: str
    income: Decimal
    employment_status: str
    term_months: int
    status: LoanApplicationStatus
    credit_score: Optional[int]
    estimated_rate: Optional[Decimal]
    estimated_monthly: Optional[Decimal] 
    submitted_date: datetime
    approved_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None

    def __post_init__(self):
        """Validate loan application data after initialization."""
        if not self.user_id:
            raise ValueError("User ID is required")
        if self.type not in ['personal', 'mortgage', 'auto', 'business']:
            raise ValueError("Invalid loan type")
        if self.amount <= 0:
            raise ValueError("Loan amount must be positive")
        if self.income <= 0:
            raise ValueError("Income must be positive")