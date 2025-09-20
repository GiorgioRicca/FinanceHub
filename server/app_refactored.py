

import os
import threading
import time
import random
import re
from decimal import Decimal
from datetime import datetime
from uuid import uuid4
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from marshmallow import ValidationError
from pathlib import Path

from container import container
from data_seeder import seed_data
from flask_swagger import setup_swagger_ui


from models.schemas import (
    UserSchema, CreateUserSchema, AccountSchema, CreateAccountSchema,
    InvestmentSchema, AvailableAssetSchema, BuyInvestmentSchema, SellInvestmentSchema,
    LoanSchema, LoanApplicationSchema, CreateLoanSchema, TransactionSchema, CreateTransactionSchema,
    NotificationSchema, CreateNotificationSchema
)


def to_camel_case(snake_str):
    
    if not isinstance(snake_str, str) or '_' not in snake_str:
        return snake_str
    components = snake_str.split('_')
    return components[0] + ''.join(x.capitalize() for x in components[1:])

def to_snake_case(camel_str):
    
    if not isinstance(camel_str, str):
        return camel_str
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', camel_str)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def to_camel_case_keys(data):
    
    if isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            
            new_key = to_camel_case(key) if isinstance(key, str) else key
            
            new_value = to_camel_case_keys(value)
            
            if isinstance(new_value, Decimal):
                new_value = float(new_value)
            elif isinstance(new_value, datetime):
                new_value = new_value.isoformat()
            new_dict[new_key] = new_value
        return new_dict
    elif isinstance(data, list):
        return [to_camel_case_keys(item) for item in data]
    elif isinstance(data, Decimal):
        return float(data)
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data

def to_snake_case_keys(data):
    
    if isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            
            new_key = to_snake_case(key) if isinstance(key, str) else key
            
            new_value = to_snake_case_keys(value)
            new_dict[new_key] = new_value
        return new_dict
    elif isinstance(data, list):
        return [to_snake_case_keys(item) for item in data]
    else:
        return data

def json_camel(data, status=200):
    
    return jsonify(to_camel_case_keys(data)), status

    
def create_app():
    app = Flask(__name__)
    container.initialize()
    seed_data()
    setup_swagger_ui(app)
    register_error_handlers(app)
    register_routes(app)
    start_background_tasks()
    return app


def register_error_handlers(app: Flask) -> None:
    
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return jsonify({"error": "Validation error", "details": error.messages}), 400
    
    @app.errorhandler(ValueError)
    def handle_value_error(error):
        return jsonify({"error": str(error)}), 400
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({"error": "Resource not found"}), 404
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        return jsonify({"error": "Internal server error"}), 500


def register_routes(app: Flask) -> None:
    
    
    
    user_service = container.get('user_service')
    account_service = container.get('account_service')
    investment_service = container.get('investment_service')
    loan_service = container.get('loan_service')
    transaction_service = container.get('transaction_service')
    notification_service = container.get('notification_service')
    dashboard_service = container.get('dashboard_service')
    
    def resolve_user_id(user_identifier: str) -> str:
        
        
        if user_identifier == "demo-user-123":
            
            user = user_service.user_repository.find_by_username("demo-user-123")
            if user:
                return user.id
            else:
                
                return user_identifier
        
        return user_identifier
    
    
    user_schema = UserSchema()
    account_schema = AccountSchema()
    investment_schema = InvestmentSchema()
    available_asset_schema = AvailableAssetSchema()
    loan_schema = LoanSchema()
    loan_application_schema = LoanApplicationSchema()
    transaction_schema = TransactionSchema()
    notification_schema = NotificationSchema()
    
    
    @app.route('/')
    @app.route('/dashboard')
    @app.route('/investments')
    @app.route('/loans')
    @app.route('/transactions')
    @app.route('/accounts')
    @app.route('/settings')
    @app.route('/loan-workflow')
    def serve_react_app():
        
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.route('/<path:path>')
    def serve_static_files(path):
        
        if path.startswith('api/'):
            return jsonify({"error": "API endpoint not found"}), 404
        
        
        try:
            return send_from_directory(app.static_folder, path)
        except:
            
            return send_from_directory(app.static_folder, 'index.html')
    
    
    @app.route('/api/dashboard/<user_id>', methods=['GET'])
    def get_dashboard(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        summary = dashboard_service.get_dashboard_summary(resolved_user_id)
        return json_camel(summary)
    
    
    @app.route('/api/users', methods=['POST'])
    def create_user():
        
        schema = CreateUserSchema()
        data = schema.load(request.json)
        user = user_service.create_user(**data)
        return json_camel(user_schema.dump(user), 201)
    
    @app.route('/api/users/<user_id>', methods=['GET'])
    def get_user(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        user = user_service.get_user(resolved_user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return json_camel(user_schema.dump(user))
    
    
    @app.route('/api/accounts/<user_id>', methods=['GET'])
    def get_accounts(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        accounts = account_service.get_user_accounts(resolved_user_id)
        
        
        result = []
        for acc in accounts:
            acc_data = account_schema.dump(acc)
            
            fixed_data = dict(acc_data)
            
            fixed_data['balance'] = float(str(fixed_data['balance'])) if 'balance' in fixed_data else 0.0
            
            if 'created_at' in fixed_data:
                fixed_data['createdAt'] = fixed_data.pop('created_at')
            if 'updated_at' in fixed_data:
                fixed_data['updatedAt'] = fixed_data.pop('updated_at')
            result.append(fixed_data)
        
        return json_camel(result)
    
    @app.route('/api/accounts', methods=['POST'])
    def create_account():
        
        schema = CreateAccountSchema()
        data = schema.load(request.json)
        account = account_service.create_account(**data)
        return json_camel(account_schema.dump(account), 201)
    
    
    @app.route('/api/assets', methods=['GET'])
    def get_available_assets():
        
        assets = investment_service.get_available_assets()
        
        
        result = []
        for asset in assets:
            asset_data = available_asset_schema.dump(asset)
            
            fixed_data = dict(asset_data)
            
            if 'current_price' in fixed_data:
                fixed_data['currentPrice'] = float(str(fixed_data['current_price']))
                del fixed_data['current_price']  
            
            if 'created_at' in fixed_data:
                fixed_data['createdAt'] = fixed_data.pop('created_at')
            if 'updated_at' in fixed_data:
                fixed_data['updatedAt'] = fixed_data.pop('updated_at')
            result.append(fixed_data)
        
        return json_camel(result)
    
    @app.route('/api/investments/<user_id>', methods=['GET'])
    def get_investments(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        investments = investment_service.get_user_portfolio(resolved_user_id)
        
        
        result = []
        for inv in investments:
            inv_data = investment_schema.dump(inv)
            
            inv_data['shares'] = float(str(inv_data['shares']))
            inv_data['purchasePrice'] = float(str(inv_data['purchase_price']))
            inv_data['currentPrice'] = float(str(inv_data['current_price']))
            
            del inv_data['purchase_price']
            del inv_data['current_price']
            
            if 'purchase_date' in inv_data:
                inv_data['purchaseDate'] = inv_data.pop('purchase_date')
            if 'updated_at' in inv_data:
                inv_data['updatedAt'] = inv_data.pop('updated_at')
            result.append(inv_data)
        
        return json_camel(result)
    
    @app.route('/api/investments/buy', methods=['POST'])
    def buy_investment():
        
        schema = BuyInvestmentSchema()
        data = schema.load(request.json)
        result = investment_service.buy_investment(
            user_id=resolve_user_id(data['userId']),
            symbol=data['symbol'],
            shares=data['shares'],
            account_id=data['accountId']
        )
        return json_camel({
            "message": result["message"],
            "investment": investment_schema.dump(result["investment"]),
            "transaction": transaction_schema.dump(result["transaction"])
        })
    
    @app.route('/api/investments/sell', methods=['POST'])
    def sell_investment():
        
        schema = SellInvestmentSchema()
        data = schema.load(request.json)
        result = investment_service.sell_investment(
            user_id=resolve_user_id(data['userId']),
            symbol=data['symbol'],
            shares=data['shares'],
            account_id=data['accountId']
        )
        return json_camel({
            "message": result["message"],
            "investment": investment_schema.dump(result["investment"]) if result["investment"] else None,
            "transaction": transaction_schema.dump(result["transaction"])
        })
    
    
    @app.route('/api/loans/<user_id>', methods=['GET'])
    def get_loans(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        loans = loan_service.get_user_loans(resolved_user_id)
        
        
        result = []
        for loan in loans:
            loan_data = loan_schema.dump(loan)
            
            fixed_data = dict(loan_data)
            
            for field in ['amount', 'interest_rate', 'monthly_payment', 'remaining_balance']:
                if field in fixed_data:
                    fixed_data[field] = float(str(fixed_data[field]))
            
            if 'amount' in fixed_data:
                fixed_data['principal'] = fixed_data['amount']  
            
            if 'created_at' in fixed_data:
                fixed_data['createdAt'] = fixed_data.pop('created_at')
                fixed_data['startDate'] = fixed_data['createdAt']  
            if 'updated_at' in fixed_data:
                fixed_data['updatedAt'] = fixed_data.pop('updated_at')
            result.append(fixed_data)
        
        return json_camel(result)
    
    @app.route('/api/loans', methods=['POST'])
    def create_loan():
        
        schema = CreateLoanSchema()
        data = schema.load(request.json)
        loan = loan_service.create_loan(**data)
        return json_camel(loan_schema.dump(loan), 201)
    
    
    @app.route('/api/loan-workflow/applications/<user_id>', methods=['GET'])
    def get_loan_applications(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        loans = loan_service.get_user_loans(resolved_user_id)
        
        
        applications = []
        for loan in loans:
            loan_data = loan_schema.dump(loan)
            application = {
                "id": loan_data["id"],
                "type": loan_data["type"],
                "amount": str(loan_data["amount"]),
                "purpose": f"{loan_data['type']} loan",
                "income": "75000",  
                "employmentStatus": "employed",
                "creditScore": 750,
                "status": "approved" if loan_data["status"] == "active" else loan_data["status"],
                "submittedDate": loan_data.get("created_at", "2025-09-20T00:00:00"),
                "estimatedRate": f"{float(loan_data['interest_rate']) * 100:.2f}%",
                "estimatedMonthly": str(loan_data["monthly_payment"]),
                "approvedDate": loan_data.get("created_at", "2025-09-20T00:00:00")
            }
            applications.append(application)
        
        return json_camel(applications)
    
    @app.route('/api/validation/loan-limits/<loan_type>', methods=['GET'])
    def get_loan_limits(loan_type: str):
        
        limits = {
            "personal": {"min_amount": 1000, "max_amount": 50000},
            "auto": {"min_amount": 5000, "max_amount": 80000},
            "mortgage": {"min_amount": 50000, "max_amount": 1000000}
        }
        return json_camel(limits.get(loan_type, {"min_amount": 1000, "max_amount": 50000}))
    
    @app.route('/api/loan-workflow/apply', methods=['POST'])
    def apply_for_loan():
        
        data = request.json or {}
        
        
        required_fields = ['type', 'amount', 'income', 'employmentStatus']
        for field in required_fields:
            if not data.get(field):
                return json_camel({"error": f"{field} is required"}, 400)
        
        
        user_id = data.get('userId', 'demo-user-123')
        data['userId'] = resolve_user_id(user_id)
        
        
        notification_service.create_notification(
            user_id=data['userId'],
            title="📋 Richiesta Prestito Ricevuta",
            message=f"La tua richiesta di prestito {data['type']} di €{data['amount']} è in fase di valutazione DTI. Ti invieremo una notifica entro 60 secondi con l'esito.",
            notification_type="info"
        )
        
        
        loan_service.process_loan_application_async(data)
        
        
        application_id = f"LOAN-{str(uuid4())[:8]}"
        
        
        return json_camel({
            "id": application_id,
            "type": data['type'],
            "amount": data['amount'],
            "purpose": data.get('purpose', f"{data['type']} loan"),
            "income": data['income'],
            "employmentStatus": data['employmentStatus'],
            "status": "pending",
            "submittedDate": datetime.now().isoformat(),
            "message": "Loan application submitted successfully. DTI evaluation in progress.",
            "estimatedProcessingTime": "60 seconds (DTI evaluation)"
        }, 201)
    
    
    @app.route('/api/calculate/loan', methods=['POST'])
    def calculate_loan():
        
        data = request.json or {}
        
        amount = float(data.get('amount', 0))
        rate = float(data.get('rate', 5.0))
        term_years = float(data.get('termYears', 5))
        
        
        monthly_rate = rate / 100 / 12
        num_payments = term_years * 12
        
        if monthly_rate == 0:
            monthly_payment = amount / num_payments
        else:
            monthly_payment = (amount * monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)
        
        total_payment = monthly_payment * num_payments
        total_interest = total_payment - amount
        
        result = {
            "monthlyPayment": round(monthly_payment, 2),
            "totalPayment": round(total_payment, 2),
            "totalInterest": round(total_interest, 2)
        }
        
        return json_camel(result)
    
    
    @app.route('/api/investment-workflow/simulations/<user_id>', methods=['GET'])
    def get_investment_simulations(user_id: str):
        
        
        return json_camel([
            {
                "id": "sim-123",
                "asset": "S&P 500 ETF",
                "amount": "10000",
                "strategy": "moderate",
                "riskLevel": "medium",
                "expectedReturn": "8.5%",
                "timeframe": "5 years",
                "submittedDate": "2025-09-20T00:00:00",
                "status": "completed",
                "projectedReturns": [
                    {"year": 1, "value": "10850", "annualReturn": "8.5"},
                    {"year": 2, "value": "11772", "annualReturn": "8.5"},
                    {"year": 3, "value": "12773", "annualReturn": "8.5"},
                    {"year": 4, "value": "13859", "annualReturn": "8.5"},
                    {"year": 5, "value": "15037", "annualReturn": "8.5"}
                ],
                "riskMetrics": {
                    "volatility": "12.5",
                    "sharpeRatio": "0.68",
                    "maxDrawdown": "15.2"
                }
            }
        ])
    
    @app.route('/api/validation/investment-limits', methods=['GET'])
    def get_investment_limits():
        
        return json_camel({
            "min_amount": 500,
            "max_amount": 100000
        })
    
    @app.route('/api/investment-workflow/simulate', methods=['POST'])
    def simulate_investment():
        
        data = request.json or {}
        
        
        required_fields = ['asset', 'amount', 'strategy', 'riskLevel']
        for field in required_fields:
            if not data.get(field):
                return json_camel({"error": f"{field} is required"}, 400)
        
        amount = float(data['amount'])
        timeframe = int(data.get('timeframe', 5))
        
        
        # rendimenti attesi per livello di rischio
        risk_returns = {
            "conservative": 5.5,
            "moderate": 8.5,
            "aggressive": 12.0
        }
        expected_return = risk_returns.get(data['riskLevel'], 8.5)
        
        
        # calcola proiezioni anno per anno
        projected_returns = []
        current_value = amount
        for year in range(1, timeframe + 1):
            current_value *= (1 + expected_return / 100)
            projected_returns.append({
                "year": year,
                "value": str(round(current_value, 2)),
                "annualReturn": str(expected_return)
            })
        
        
        # crea la simulazione
        simulation = {
            "id": str(uuid4()),
            "asset": data['asset'],
            "amount": data['amount'],
            "strategy": data['strategy'],
            "riskLevel": data['riskLevel'],
            "expectedReturn": f"{expected_return}%",
            "timeframe": f"{timeframe} years",
            "submittedDate": datetime.now().isoformat(),
            "status": "completed",
            "projectedReturns": projected_returns,
            "riskMetrics": {
                "volatility": "12.5" if data['riskLevel'] == 'moderate' else ("8.2" if data['riskLevel'] == 'conservative' else "18.7"),
                "sharpeRatio": "0.68" if data['riskLevel'] == 'moderate' else ("0.52" if data['riskLevel'] == 'conservative' else "0.81"),
                "maxDrawdown": "15.2" if data['riskLevel'] == 'moderate' else ("8.5" if data['riskLevel'] == 'conservative' else "25.8")
            }
        }
        
        return json_camel(simulation, 201)
    
    @app.route('/api/investment-workflow/execute', methods=['POST'])
    def execute_investment():
        
        data = request.json or {}
        
        simulation_id = data.get('simulationId')
        amount = data.get('amount')
        
        if not simulation_id or not amount:
            return json_camel({"error": "simulationId and amount are required"}, 400)
        
        
        confirmation = {
            "confirmationNumber": f"INV-{uuid4().hex[:8].upper()}",
            "message": f"Investment of €{amount} executed successfully",
            "timestamp": datetime.now().isoformat()
        }
        
        return json_camel(confirmation, 201)
    
    
    @app.route('/api/transactions/recent/<user_id>', methods=['GET'])
    def get_recent_transactions(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        limit = request.args.get('limit', 50, type=int)
        transactions = transaction_service.get_user_recent_transactions(resolved_user_id, limit)
        
        
        result = []
        for txn in transactions:
            txn_data = transaction_schema.dump(txn)
            
            fixed_data = dict(txn_data)
            
            if 'amount' in fixed_data:
                fixed_data['amount'] = float(str(fixed_data['amount']))
            
            if 'transaction_date' in fixed_data:
                fixed_data['transactionDate'] = fixed_data.pop('transaction_date')
                
                fixed_data['date'] = fixed_data['transactionDate']
            if 'created_at' in fixed_data:
                fixed_data['createdAt'] = fixed_data.pop('created_at')
            result.append(fixed_data)
        
        return json_camel(result)
    
    @app.route('/api/transactions/recent/<user_id>/<limit>', methods=['GET'])
    def get_recent_transactions_with_limit(user_id: str, limit: str):
        
        resolved_user_id = resolve_user_id(user_id)
        limit_int = int(limit)
        transactions = transaction_service.get_user_recent_transactions(resolved_user_id, limit_int)
        
        
        result = []
        for txn in transactions:
            txn_data = transaction_schema.dump(txn)
            
            fixed_data = dict(txn_data)
            
            if 'amount' in fixed_data:
                fixed_data['amount'] = float(str(fixed_data['amount']))
            
            if 'transaction_date' in fixed_data:
                fixed_data['transactionDate'] = fixed_data.pop('transaction_date')
                
                fixed_data['date'] = fixed_data['transactionDate']
            if 'created_at' in fixed_data:
                fixed_data['createdAt'] = fixed_data.pop('created_at')
            result.append(fixed_data)
        
        return json_camel(result)
    
    @app.route('/api/transactions', methods=['POST'])
    def create_transaction():
        
        schema = CreateTransactionSchema()
        data = schema.load(request.json)
        user_id = request.json.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        transaction = transaction_service.create_transaction(
            account_id=data['account_id'],
            amount=data['amount'],
            description=data['description'],
            category=data['category'],
            user_id=resolve_user_id(user_id)
        )
        return json_camel(transaction_schema.dump(transaction), 201)
    
    
    @app.route('/api/transactions/<user_id>', methods=['GET'])
    def get_user_all_transactions(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        limit = request.args.get('limit', 100, type=int)
        transactions = transaction_service.get_user_recent_transactions(resolved_user_id, limit)
        
        
        result = []
        for txn in transactions:
            txn_data = transaction_schema.dump(txn)
            
            fixed_data = dict(txn_data)
            if 'amount' in fixed_data:
                fixed_data['amount'] = float(str(fixed_data['amount']))
            result.append(fixed_data)
        
        return json_camel(result)
    
    @app.route('/api/loan-requests/<user_id>', methods=['GET'])  
    def get_user_loan_requests(user_id: str):
        
        
        return json_camel([
            {
                "id": "req-123",
                "amount": 50000.0,
                "type": "personal", 
                "status": "approved",
                "created_at": "2025-09-19T10:00:00.000000",
                "updated_at": "2025-09-19T12:00:00.000000"
            }
        ])
    
    
    @app.route('/api/notifications/<user_id>', methods=['GET'])
    def get_notifications(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        notifications = notification_service.get_user_notifications(resolved_user_id)
        
        result = []
        for notif in notifications:
            notif_data = notification_schema.dump(notif)
            if notif_data.get('read_at') is None:
                notif_data.pop('read_at', None)
            
            if 'created_at' in notif_data:
                notif_data['createdAt'] = notif_data.pop('created_at')
            result.append(notif_data)
        return json_camel(result)
    
    @app.route('/api/notifications/<user_id>/unread', methods=['GET'])
    def get_unread_notifications(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        notifications = notification_service.get_unread_notifications(resolved_user_id)
        
        result = []
        for notif in notifications:
            notif_data = notification_schema.dump(notif)
            if notif_data.get('read_at') is None:
                notif_data.pop('read_at', None)
            
            if 'created_at' in notif_data:
                notif_data['createdAt'] = notif_data.pop('created_at')
            result.append(notif_data)
        return json_camel(result)
    
    @app.route('/api/notifications/<notification_id>/read', methods=['POST'])
    def mark_notification_read(notification_id: str):
        
        user_id = request.json.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        resolved_user_id = resolve_user_id(user_id)
        notification = notification_service.mark_as_read(notification_id, resolved_user_id)
        if not notification:
            return jsonify({"error": "Notification not found"}), 404
        return json_camel(notification_schema.dump(notification))
    
    @app.route('/api/notifications/<user_id>/read-all', methods=['POST'])
    def mark_all_notifications_read(user_id: str):
        
        resolved_user_id = resolve_user_id(user_id)
        count = notification_service.mark_all_as_read(resolved_user_id)
        return json_camel({"message": f"Marked {count} notifications as read"})
    
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        
        return json_camel({
            "status": "healthy",
            "service": "FinanceHub API",
            "version": "1.0.0"
        })


def start_background_tasks():
    
    
    def update_investment_prices():
        
        while True:
            try:
                time.sleep(30)  
                
                
                investment_service = container.get('investment_service')
                available_asset_repository = container.get('available_asset_repository')
                
                
                assets = available_asset_repository.get_all()
                
                
                price_updates = {}
                for asset in assets:
                    
                    variation = random.uniform(-0.02, 0.02)
                    new_price = asset.current_price * (1 + Decimal(str(variation)))
                    new_price = new_price.quantize(Decimal('0.01'))
                    price_updates[asset.symbol] = new_price
                
                
                investment_service.update_prices(price_updates)
                
            except Exception as e:
                print(f"Error updating prices: {e}")
                time.sleep(60)  
    
    
    price_thread = threading.Thread(target=update_investment_prices, daemon=True)
    price_thread.start()



app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)