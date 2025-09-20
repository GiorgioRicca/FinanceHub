

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass
class Investment:
    """
    Rappresenta un investimento nel portafoglio dell'utente.
    Traccia azioni, prezzi di acquisto e vendita, e calcola profitti/perdite.
    Fornisce metodi per calcolare il valore attuale e le performance.
    """
    
    id: str
    user_id: str
    symbol: str
    name: str
    shares: Decimal
    purchase_price: Decimal
    current_price: Decimal
    purchase_date: datetime
    updated_at: datetime

    def __post_init__(self):
        
        if not self.user_id:
            raise ValueError("User ID is required")
        if not self.symbol:
            raise ValueError("Symbol is required")
        if self.shares <= 0:
            raise ValueError("Shares must be positive")
        if self.purchase_price <= 0:
            raise ValueError("Purchase price must be positive")

    @property
    def current_value(self) -> Decimal:
        
        return self.shares * self.current_price

    @property
    def profit_loss(self) -> Decimal:
        
        return self.current_value - (self.shares * self.purchase_price)

    @property
    def profit_loss_percentage(self) -> float:
        
        cost_basis = self.shares * self.purchase_price
        if cost_basis == 0:
            return 0.0
        return float((self.profit_loss / cost_basis) * 100)


@dataclass
class AvailableAsset:
    """
    Rappresenta un asset finanziario disponibile per il trading.
    Contiene informazioni su azioni, ETF e obbligazioni negoziabili.
    Gestisce prezzi correnti e metadati di mercato per ogni strumento.
    """
    
    id: str
    symbol: str
    name: str
    current_price: Decimal
    asset_type: str
    market: str
    currency: str
    created_at: datetime
    updated_at: datetime

    def __post_init__(self):
        
        if not self.symbol:
            raise ValueError("Symbol is required")
        if not self.name:
            raise ValueError("Name is required")
        if self.current_price <= 0:
            raise ValueError("Current price must be positive")