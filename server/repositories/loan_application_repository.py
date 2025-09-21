from typing import List
from models.loan import LoanApplication
from .base import BaseRepository


class LoanApplicationRepository(BaseRepository[LoanApplication]):
    
    def find_by_user_id(self, user_id: str) -> List[LoanApplication]:
        return [app for app in self._data.values() if app.user_id == user_id]
    
    def find_by_status(self, status: str) -> List[LoanApplication]:
        return [app for app in self._data.values() if app.status == status]
    
    def find_pending_applications(self) -> List[LoanApplication]:
        return [app for app in self._data.values() if app.status in ['pending', 'evaluating']]
    
    def update_status(self, application_id: str, status: str, rejection_reason: str = None) -> LoanApplication:
        if application_id not in self._data:
            raise ValueError(f"Loan application {application_id} not found")
        
        application = self._data[application_id]
        application.status = status
        if rejection_reason:
            application.rejection_reason = rejection_reason
        
        return application