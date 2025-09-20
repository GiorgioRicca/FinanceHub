

from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
from uuid import uuid4
from models.investment import Investment, AvailableAsset
from repositories.investment_repository import InvestmentRepository, AvailableAssetRepository
from repositories.account_repository import AccountRepository
from repositories.transaction_repository import TransactionRepository


class InvestmentService:
    """
    Servizio per la gestione del portafoglio investimenti.
    Implementa logica di acquisto/vendita con validazioni e calcoli.
    Coordina aggiornamenti di prezzo e notifiche per operazioni.
    """
    
    
    def __init__(self,
                 investment_repository: InvestmentRepository,
                 available_asset_repository: AvailableAssetRepository,
                 account_repository: AccountRepository,
                 transaction_repository: TransactionRepository,
                 notification_service):
        self.investment_repository = investment_repository
        self.available_asset_repository = available_asset_repository
        self.account_repository = account_repository
        self.transaction_repository = transaction_repository
        self.notification_service = notification_service
    
    def get_user_portfolio(self, user_id: str) -> List[Investment]:
        
        return self.investment_repository.find_by_user_id(user_id)
    
    def get_available_assets(self) -> List[AvailableAsset]:
        
        return self.available_asset_repository.get_all()
    
    def buy_investment(self, user_id: str, symbol: str, shares: str, account_id: str) -> Dict[str, Any]:
        
        
        shares_decimal = Decimal(shares)
        if shares_decimal <= 0:
            raise ValueError("Shares must be positive")
        
        
        account = self.account_repository.get_by_id(account_id)
        if not account or account.user_id != user_id:
            raise ValueError("Account not found or access denied")
        
        
        available_asset = self.available_asset_repository.find_by_symbol(symbol)
        if not available_asset:
            raise ValueError(f"Asset {symbol} not available for trading")
        
        
        total_cost = shares_decimal * available_asset.current_price
        
        
        if account.balance < total_cost:
            raise ValueError("Insufficient funds")
        
        
        existing_investment = self.investment_repository.find_by_symbol(user_id, symbol)
        
        if existing_investment:
            
            current_value = existing_investment.shares * existing_investment.purchase_price
            new_total_shares = existing_investment.shares + shares_decimal
            new_total_value = current_value + total_cost
            new_average_price = new_total_value / new_total_shares
            
            existing_investment.shares = new_total_shares
            existing_investment.purchase_price = new_average_price
            existing_investment.current_price = available_asset.current_price
            existing_investment.updated_at = datetime.now()
            
            investment = self.investment_repository.update(existing_investment.id, existing_investment)
        else:
            
            investment = Investment(
                id=str(uuid4()),
                user_id=user_id,
                symbol=symbol,
                name=available_asset.name,
                shares=shares_decimal,
                purchase_price=available_asset.current_price,
                current_price=available_asset.current_price,
                purchase_date=datetime.now(),
                updated_at=datetime.now()
            )
            investment = self.investment_repository.create(investment)
        
        
        new_balance = account.balance - total_cost
        self.account_repository.update_balance(account_id, new_balance)
        
        
        from models.transaction import Transaction
        transaction = Transaction(
            id=str(uuid4()),
            account_id=account_id,
            amount=-total_cost,
            description=f"Acquisto {shares} azioni {symbol}",
            category="Investimenti",
            transaction_date=datetime.now(),
            created_at=datetime.now(),
            reference_number=f"INV-{symbol}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        )
        self.transaction_repository.create(transaction)
        
        
        self.notification_service.create_notification(
            user_id=user_id,
            title="Investimento Acquistato",
            message=f"Acquistate {shares} azioni di {symbol} per €{total_cost:.2f}",
            notification_type="success"
        )
        
        return {
            "investment": investment,
            "transaction": transaction,
            "message": f"Successfully purchased {shares} shares of {symbol}"
        }
    
    def sell_investment(self, user_id: str, symbol: str, shares: str, account_id: str) -> Dict[str, Any]:
        
        
        shares_decimal = Decimal(shares)
        if shares_decimal <= 0:
            raise ValueError("Shares must be positive")
        
        
        account = self.account_repository.get_by_id(account_id)
        if not account or account.user_id != user_id:
            raise ValueError("Account not found or access denied")
        
        
        investment = self.investment_repository.find_by_symbol(user_id, symbol)
        if not investment:
            raise ValueError(f"No investment found for {symbol}")
        
        if investment.shares < shares_decimal:
            raise ValueError("Insufficient shares to sell")
        
        
        available_asset = self.available_asset_repository.find_by_symbol(symbol)
        if not available_asset:
            raise ValueError(f"Asset {symbol} not available for trading")
        
        
        sale_proceeds = shares_decimal * available_asset.current_price
        
        
        investment.shares -= shares_decimal
        investment.current_price = available_asset.current_price
        investment.updated_at = datetime.now()
        
        
        if investment.shares == 0:
            self.investment_repository.delete(investment.id)
            investment = None
        else:
            investment = self.investment_repository.update(investment.id, investment)
        
        
        new_balance = account.balance + sale_proceeds
        self.account_repository.update_balance(account_id, new_balance)
        
        
        from models.transaction import Transaction
        transaction = Transaction(
            id=str(uuid4()),
            account_id=account_id,
            amount=sale_proceeds,
            description=f"Vendita {shares} azioni {symbol}",
            category="Investimenti",
            transaction_date=datetime.now(),
            created_at=datetime.now(),
            reference_number=f"SELL-{symbol}-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        )
        self.transaction_repository.create(transaction)
        
        
        self.notification_service.create_notification(
            user_id=user_id,
            title="Investimento Venduto",
            message=f"Vendute {shares} azioni di {symbol} per €{sale_proceeds:.2f}",
            notification_type="success"
        )
        
        return {
            "investment": investment,
            "transaction": transaction,
            "message": f"Successfully sold {shares} shares of {symbol}"
        }
    
    def update_prices(self, price_updates: Dict[str, Decimal]):
        
        
        for symbol, new_price in price_updates.items():
            asset = self.available_asset_repository.find_by_symbol(symbol)
            if asset:
                asset.current_price = new_price
                asset.updated_at = datetime.now()
                self.available_asset_repository.update(asset.id, asset)
        
        
        for investment in self.investment_repository.get_all():
            if investment.symbol in price_updates:
                self.investment_repository.update_current_price(
                    investment.id, 
                    price_updates[investment.symbol]
                )