

from typing import Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta
from repositories.account_repository import AccountRepository
from repositories.investment_repository import InvestmentRepository
from repositories.loan_repository import LoanRepository
from repositories.transaction_repository import TransactionRepository


class DashboardService:
    """
    Servizio per la generazione del riassunto dashboard finanziaria.
    Aggrega dati da tutti i repository per fornire vista completa.
    Calcola metriche di performance, spese e crescita investimenti.
    """
    
    
    def __init__(self,
                 account_repository: AccountRepository,
                 investment_repository: InvestmentRepository,
                 loan_repository: LoanRepository,
                 transaction_repository: TransactionRepository):
        self.account_repository = account_repository
        self.investment_repository = investment_repository
        self.loan_repository = loan_repository
        self.transaction_repository = transaction_repository
    
    def get_dashboard_summary(self, user_id: str) -> Dict[str, Any]:
        
        
        total_balance = self.account_repository.get_total_balance_by_user(user_id, exclude_loan_accounts=True)
        
        
        investments = self.investment_repository.find_by_user_id(user_id)
        total_investments = sum(
            investment.shares * investment.current_price 
            for investment in investments
        )
        
        
        investment_growth = self._calculate_investment_growth(investments)
        
        
        accounts = self.account_repository.find_by_user_id(user_id)
        account_ids = [acc.id for acc in accounts if acc.type != 'loan']
        
        
        monthly_expenses = self.transaction_repository.get_monthly_expenses(account_ids)
        
        
        expense_variation = self._calculate_expense_variation(account_ids)
        
        
        active_loan_balance = self.loan_repository.get_total_remaining_balance(user_id)
        active_loans_count = len(self.loan_repository.find_active_loans(user_id))
        
        return {
            "totalBalance": float(total_balance),
            "totalInvestments": float(total_investments),
            "monthlyExpenses": float(monthly_expenses),
            "activeLoanBalance": float(active_loan_balance),
            "investmentGrowth": f"{investment_growth:+.1f}%",
            "expenseVariation": f"{expense_variation:+.1f}%",
            "activeLoansCount": active_loans_count
        }
    
    def _calculate_investment_growth(self, investments) -> float:
        
        total_current_value = Decimal('0')
        total_cost_basis = Decimal('0')
        
        for investment in investments:
            current_value = investment.shares * investment.current_price
            cost_basis = investment.shares * investment.purchase_price
            total_current_value += current_value
            total_cost_basis += cost_basis
        
        if total_cost_basis == 0:
            return 0.0
        
        growth = ((total_current_value - total_cost_basis) / total_cost_basis) * 100
        return float(growth)
    
    def _calculate_expense_variation(self, account_ids) -> float:
        
        return self.transaction_repository.get_expense_variation(account_ids)