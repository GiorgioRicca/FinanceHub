

from typing import List, Optional
from decimal import Decimal
from models.investment import Investment, AvailableAsset
from .base import BaseRepository


class InvestmentRepository(BaseRepository[Investment]):
    """
    Repository per la gestione del portafoglio investimenti dell'utente.
    Implementa operazioni per calcolare valore totale e cost basis.
    Gestisce aggiornamenti di prezzo e ricerche per simbolo e utente.
    """
    
    
    def find_by_user_id(self, user_id: str) -> List[Investment]:
        
        return [inv for inv in self._data.values() if inv.user_id == user_id]
    
    def find_by_symbol(self, user_id: str, symbol: str) -> Optional[Investment]:
        
        for investment in self._data.values():
            if investment.user_id == user_id and investment.symbol == symbol:
                return investment
        return None
    
    def get_total_value(self, user_id: str) -> Decimal:
        
        investments = self.find_by_user_id(user_id)
        return sum(inv.current_value for inv in investments)
    
    def get_total_cost_basis(self, user_id: str) -> Decimal:
        
        investments = self.find_by_user_id(user_id)
        return sum(inv.shares * inv.purchase_price for inv in investments)
    
    def update_current_price(self, investment_id: str, new_price: Decimal) -> Optional[Investment]:
        
        investment = self.get_by_id(investment_id)
        if investment:
            investment.current_price = new_price
            from datetime import datetime
            investment.updated_at = datetime.now()
            return investment
        return None


class AvailableAssetRepository(BaseRepository[AvailableAsset]):
    """
    Repository per la gestione degli asset finanziari disponibili per trading.
    Implementa ricerche per simbolo, mercato e tipo di asset.
    Gestisce il catalogo di strumenti finanziari negoziabili nel sistema.
    """
    
    
    def find_by_symbol(self, symbol: str) -> Optional[AvailableAsset]:
        
        for asset in self._data.values():
            if asset.symbol == symbol:
                return asset
        return None
    
    def find_by_market(self, market: str) -> List[AvailableAsset]:
        
        return [asset for asset in self._data.values() if asset.market == market]
    
    def find_by_type(self, asset_type: str) -> List[AvailableAsset]:
        
        return [asset for asset in self._data.values() if asset.asset_type == asset_type]