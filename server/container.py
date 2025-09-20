

from typing import Dict, Any, TypeVar, Type
from repositories.user_repository import UserRepository
from repositories.account_repository import AccountRepository
from repositories.investment_repository import InvestmentRepository, AvailableAssetRepository
from repositories.loan_repository import LoanRepository
from repositories.transaction_repository import TransactionRepository
from repositories.notification_repository import NotificationRepository

from services.user_service import UserService
from services.account_service import AccountService
from services.investment_service import InvestmentService
from services.loan_service import LoanService
from services.transaction_service import TransactionService
from services.notification_service import NotificationService
from services.dashboard_service import DashboardService


T = TypeVar('T')


class Container:
    """
    Container di dependency injection per la gestione dei servizi.
    Implementa pattern IoC per registrazione e risoluzione dipendenze.
    Gestisce inizializzazione e configurazione di tutti i componenti sistema.
    """
    
    
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._initialized = False
    
    def register(self, name: str, service: Any) -> None:
        
        self._services[name] = service
    
    def get(self, name: str) -> Any:
        
        if name not in self._services:
            raise ValueError(f"Service '{name}' not registered")
        return self._services[name]
    
    def initialize(self):
        
        if self._initialized:
            return
        
        
        user_repository = UserRepository()
        account_repository = AccountRepository()
        investment_repository = InvestmentRepository()
        available_asset_repository = AvailableAssetRepository()
        loan_repository = LoanRepository()
        transaction_repository = TransactionRepository()
        notification_repository = NotificationRepository()
        
        
        self.register('user_repository', user_repository)
        self.register('account_repository', account_repository)
        self.register('investment_repository', investment_repository)
        self.register('available_asset_repository', available_asset_repository)
        self.register('loan_repository', loan_repository)
        self.register('transaction_repository', transaction_repository)
        self.register('notification_repository', notification_repository)
        
        
        notification_service = NotificationService(notification_repository)
        self.register('notification_service', notification_service)
        
        
        user_service = UserService(user_repository)
        account_service = AccountService(account_repository, notification_service)
        investment_service = InvestmentService(
            investment_repository,
            available_asset_repository,
            account_repository,
            transaction_repository,
            notification_service
        )
        loan_service = LoanService(
            loan_repository,
            account_repository,
            transaction_repository,
            notification_service
        )
        transaction_service = TransactionService(
            transaction_repository,
            account_repository,
            notification_service
        )
        dashboard_service = DashboardService(
            account_repository,
            investment_repository,
            loan_repository,
            transaction_repository
        )
        
        
        self.register('user_service', user_service)
        self.register('account_service', account_service)
        self.register('investment_service', investment_service)
        self.register('loan_service', loan_service)
        self.register('transaction_service', transaction_service)
        self.register('dashboard_service', dashboard_service)
        
        self._initialized = True
    
    def clear(self):
        
        self._services.clear()
        self._initialized = False



container = Container()