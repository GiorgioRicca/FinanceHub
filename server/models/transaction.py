

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass
class Transaction:
    """
    Rappresenta una transazione finanziaria su un conto specifico.
    Traccia movimenti di denaro con descrizione, categoria e date.
    Fornisce metodi per identificare se è un addebito o accredito.
    """
    
    id: str
    account_id: str
    amount: Decimal
    description: str
    category: str
    transaction_date: datetime
    created_at: datetime
    reference_number: Optional[str] = None

    def __post_init__(self):
        # controlli base
        if not self.account_id:
            raise ValueError("Account ID is required")
        if self.amount == 0:
            raise ValueError("Transaction amount cannot be zero")
        if not self.description:
            raise ValueError("Description is required")
        if not self.category:
            raise ValueError("Category is required")

    @property
    def is_debit(self) -> bool:
        # è un addebito?
        return self.amount < 0

    @property
    def is_credit(self) -> bool:
        # è un accredito?
        return self.amount > 0

    @property
    def formatted_amount(self) -> str:
        # formatta l'importo
        return f"€{abs(self.amount):,.2f}"