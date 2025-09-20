

import threading
import time
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime
from uuid import uuid4
from models.loan import Loan, LoanType, LoanStatus
from repositories.loan_repository import LoanRepository
from repositories.account_repository import AccountRepository
from repositories.transaction_repository import TransactionRepository


class LoanService:
    """
    Servizio per la gestione dei prestiti e valutazione creditizia.
    Implementa calcoli di rate, DTI e processi di approvazione asincroni.
    Gestisce erogazione fondi e creazione automatica di conti prestito.
    """
    
    
    def __init__(self,
                 loan_repository: LoanRepository,
                 account_repository: AccountRepository,
                 transaction_repository: TransactionRepository,
                 notification_service):
        self.loan_repository = loan_repository
        self.account_repository = account_repository
        self.transaction_repository = transaction_repository
        self.notification_service = notification_service
    
    def get_user_loans(self, user_id: str) -> List[Loan]:
        
        return self.loan_repository.find_by_user_id(user_id)

    
    def create_loan(self, user_id: str, loan_type: LoanType, amount: Decimal,
                   interest_rate: Decimal, term_months: int) -> Loan:
        
        
        monthly_interest_rate = interest_rate / Decimal('100') / Decimal('12')
        if monthly_interest_rate > 0:
            monthly_payment = amount * (
                monthly_interest_rate * (1 + monthly_interest_rate) ** term_months
            ) / ((1 + monthly_interest_rate) ** term_months - 1)
        else:
            
            monthly_payment = amount / term_months
        
        
        loan = Loan(
            id=str(uuid4()),
            user_id=user_id,
            type=loan_type,
            amount=amount,
            interest_rate=interest_rate,
            term_months=term_months,
            monthly_payment=monthly_payment,
            remaining_balance=amount,
            status='active',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        created_loan = self.loan_repository.create(loan)
        
        
        loan_accounts = self.account_repository.find_by_type(user_id, 'loan')
        if loan_accounts:
            
            loan_account = loan_accounts[0]
            new_balance = loan_account.balance - amount  
            self.account_repository.update_balance(loan_account.id, new_balance)
        else:
            
            from models.account import Account
            loan_account = self.account_repository.create_account(
                user_id=user_id,
                name="Conto Prestiti",
                account_type='loan',
                initial_balance=-amount
            )
        
        
        checking_accounts = self.account_repository.find_by_type(user_id, 'checking')
        if checking_accounts:
            primary_account = checking_accounts[0]
            new_balance = primary_account.balance + amount
            self.account_repository.update_balance(primary_account.id, new_balance)
            
            
            from models.transaction import Transaction
            transaction = Transaction(
                id=str(uuid4()),
                account_id=primary_account.id,
                amount=amount,
                description=f"Erogazione prestito {loan_type}",
                category="Prestiti",
                transaction_date=datetime.now(),
                created_at=datetime.now(),
                reference_number=f"LOAN-{created_loan.id[:8]}"
            )
            self.transaction_repository.create(transaction)
        
        
        self.notification_service.create_notification(
            user_id=user_id,
            title="Prestito Approvato",
            message=f"Prestito di €{amount:,.2f} approvato e erogato",
            notification_type="success"
        )
        
        return created_loan

    
    def calculate_dti_ratio(self, monthly_income: Decimal, monthly_debt_payment: Decimal) -> Decimal:
        
        if monthly_income <= 0:
            return Decimal('100')  
        
        return (monthly_debt_payment / monthly_income) * Decimal('100')
    
    def calculate_monthly_payment(self, amount: Decimal, interest_rate: Decimal, term_months: int) -> Decimal:
        
        monthly_interest_rate = interest_rate / Decimal('100') / Decimal('12')
        if monthly_interest_rate > 0:
            monthly_payment = amount * (
                monthly_interest_rate * (1 + monthly_interest_rate) ** term_months
            ) / ((1 + monthly_interest_rate) ** term_months - 1)
        else:
            
            monthly_payment = amount / term_months
        
        return monthly_payment
    
    def evaluate_loan_application(self, application_data: Dict[str, Any]) -> Dict[str, Any]:
        
        try:
            
            user_id = application_data['userId']
            loan_type = application_data['type']
            amount = Decimal(str(application_data['amount']))
            annual_income = Decimal(str(application_data['income']))
            employment_status = application_data['employmentStatus']
            
            
            interest_rates = {
                'personal': Decimal('8.5'),
                'auto': Decimal('6.2'),
                'mortgage': Decimal('4.8'),
                'business': Decimal('9.5')
            }
            interest_rate = interest_rates.get(loan_type, Decimal('8.5'))
            
            
            default_terms = {
                'personal': 36,
                'auto': 60,
                'mortgage': 360,
                'business': 60
            }
            term_months = int(application_data.get('termMonths', default_terms.get(loan_type, 36)))
            
            
            monthly_payment = self.calculate_monthly_payment(amount, interest_rate, term_months)
            monthly_income = annual_income / Decimal('12')
            
            
            user_accounts = self.account_repository.find_by_user_id(user_id)
            account_ids = [acc.id for acc in user_accounts]
            existing_debt_payments = self.transaction_repository.get_monthly_expenses(account_ids)
            
            
            total_monthly_debt = existing_debt_payments + monthly_payment
            
            
            dti_ratio = self.calculate_dti_ratio(monthly_income, total_monthly_debt)
            
            
            max_dti = Decimal('40')  
            min_income = Decimal('2000')  
            
            
            approved = (
                dti_ratio <= max_dti and
                monthly_income >= min_income and
                employment_status in ['employed', 'self_employed'] and
                amount >= Decimal('1000') and
                amount <= Decimal('1000000')
            )
            
            evaluation_result = {
                'approved': approved,
                'dti_ratio': float(dti_ratio),
                'monthly_payment': float(monthly_payment),
                'monthly_income': float(monthly_income),
                'total_monthly_debt': float(total_monthly_debt),
                'reason': self._get_evaluation_reason(approved, dti_ratio, monthly_income, employment_status)
            }
            
            return evaluation_result
            
        except Exception as e:
            return {
                'approved': False,
                'dti_ratio': 100.0,
                'reason': f'Errore nella valutazione: {str(e)}'
            }
    
    def _get_evaluation_reason(self, approved: bool, dti_ratio: Decimal, monthly_income: Decimal, employment_status: str) -> str:
        
        if approved:
            return f"Prestito approvato. DTI: {dti_ratio:.1f}%, reddito sostenibile."
        
        reasons = []
        if dti_ratio > Decimal('40'):
            reasons.append(f"DTI troppo alto ({dti_ratio:.1f}% > 40%)")
        if monthly_income < Decimal('2000'):
            reasons.append(f"Reddito insufficiente (€{monthly_income:.0f} < €2000)")
        if employment_status not in ['employed', 'self_employed']:
            reasons.append("Stato occupazionale non valido")
        
        return "Prestito rifiutato: " + ", ".join(reasons)
    
    def process_loan_application_async(self, application_data: Dict[str, Any]) -> None:
        
        def evaluate_and_notify():
            try:

                time.sleep(60)
                
                user_id = application_data['userId']
                evaluation = self.evaluate_loan_application(application_data)
                
                if evaluation['approved']:
                    
                    loan_type = application_data['type']
                    amount = Decimal(str(application_data['amount']))
                    
                    
                    interest_rates = {
                        'personal': Decimal('8.5'),
                        'auto': Decimal('6.2'),
                        'mortgage': Decimal('4.8'),
                        'business': Decimal('9.5')
                    }
                    interest_rate = interest_rates.get(loan_type, Decimal('8.5'))
                    
                    default_terms = {
                        'personal': 36,
                        'auto': 60,
                        'mortgage': 360,
                        'business': 60
                    }
                    term_months = int(application_data.get('termMonths', default_terms.get(loan_type, 36)))
                    
                    
                    self.create_loan(user_id, loan_type, amount, interest_rate, term_months)
                    
                    
                    self.notification_service.create_notification(
                        user_id=user_id,
                        title="Prestito Approvato",
                        message=f"La tua richiesta di prestito {loan_type} di €{amount:,.2f} è stata approvata! DTI: {evaluation['dti_ratio']:.1f}%. Fondi erogati sul tuo conto.",
                        notification_type="success"
                    )
                else:
                    
                    self.notification_service.create_notification(
                        user_id=user_id,
                        title="Prestito Rifiutato",
                        message=f"La tua richiesta di prestito non è stata approvata. {evaluation['reason']}",
                        notification_type="error"
                    )
                    
            except Exception as e:
                
                self.notification_service.create_notification(
                    user_id=application_data.get('userId', 'unknown'),
                    title=" Errore Valutazione",
                    message=f"Si è verificato un errore durante la valutazione della richiesta: {str(e)}",
                    notification_type="error"
                )
        
        
        thread = threading.Thread(target=evaluate_and_notify)
        thread.daemon = True
        thread.start()