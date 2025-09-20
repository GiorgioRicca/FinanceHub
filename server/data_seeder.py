

import random
from decimal import Decimal
from datetime import datetime, timedelta
from uuid import uuid4
from container import container
from models.user import User
from models.account import Account
from models.investment import Investment, AvailableAsset
from models.loan import Loan
from models.transaction import Transaction
from models.notification import Notification


def seed_available_assets():
    
    available_asset_repository = container.get('available_asset_repository')
    
    
    assets = [
        {
            'symbol': 'ENI',
            'name': 'Eni S.p.A.',
            'asset_type': 'Azione',
            'market': 'Borsa Italiana',
            'currency': 'EUR',
            'base_price': Decimal('13.45')
        },
        {
            'symbol': 'ENEL',
            'name': 'Enel S.p.A.',
            'asset_type': 'Azione',
            'market': 'Borsa Italiana',
            'currency': 'EUR',
            'base_price': Decimal('6.20')
        },
        {
            'symbol': 'UCG',
            'name': 'UniCredit S.p.A.',
            'asset_type': 'Azione',
            'market': 'Borsa Italiana',
            'currency': 'EUR',
            'base_price': Decimal('28.90')
        },
        {
            'symbol': 'ISP',
            'name': 'Intesa Sanpaolo S.p.A.',
            'asset_type': 'Azione',
            'market': 'Borsa Italiana',
            'currency': 'EUR',
            'base_price': Decimal('3.15')
        },
        {
            'symbol': 'TIT',
            'name': 'Telecom Italia S.p.A.',
            'asset_type': 'Azione',
            'market': 'Borsa Italiana',
            'currency': 'EUR',
            'base_price': Decimal('0.24')
        },
        {
            'symbol': 'RACE',
            'name': 'Ferrari N.V.',
            'asset_type': 'Azione',
            'market': 'Borsa Italiana',
            'currency': 'EUR',
            'base_price': Decimal('385.00')
        },
        {
            'symbol': 'G',
            'name': 'Generali Assicurazioni S.p.A.',
            'asset_type': 'Azione',
            'market': 'Borsa Italiana',
            'currency': 'EUR',
            'base_price': Decimal('23.50')
        },
        {
            'symbol': 'FTSE-MIB',
            'name': 'FTSE MIB ETF',
            'asset_type': 'ETF',
            'market': 'Borsa Italiana',
            'currency': 'EUR',
            'base_price': Decimal('26.80')
        },
        {
            'symbol': 'BTP-10Y',
            'name': 'BTP Italia 10 anni',
            'asset_type': 'Obbligazione',
            'market': 'MTS',
            'currency': 'EUR',
            'base_price': Decimal('98.50')
        },
        {
            'symbol': 'CCT-5Y',
            'name': 'CCT 5 anni',
            'asset_type': 'Obbligazione',
            'market': 'MTS',
            'currency': 'EUR',
            'base_price': Decimal('101.20')
        }
    ]
    
    for asset_data in assets:
        
        price_variation = random.uniform(-0.10, 0.10)
        current_price = asset_data['base_price'] * (1 + Decimal(str(price_variation)))
        current_price = current_price.quantize(Decimal('0.01'))
        
        asset = AvailableAsset(
            id=str(uuid4()),
            symbol=asset_data['symbol'],
            name=asset_data['name'],
            current_price=current_price,
            asset_type=asset_data['asset_type'],
            market=asset_data['market'],
            currency=asset_data['currency'],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        available_asset_repository.create(asset)


def create_demo_user():
    
    user_service = container.get('user_service')
    account_service = container.get('account_service')
    investment_service = container.get('investment_service')
    loan_service = container.get('loan_service')
    transaction_service = container.get('transaction_service')
    notification_service = container.get('notification_service')
    
    print("Creating demo user...")
    
    
    try:
        demo_user = user_service.create_user(
            username="demo-user-123",
            password="demo-password",
            name="Mario Rossi",
            email="mario.rossi@example.it"
        )
        print(f"Demo user created: {demo_user.username} (ID: {demo_user.id})")
    except ValueError:
        
        demo_user = user_service.get_user_by_username("demo-user-123")
        print(f"Demo user exists: {demo_user.username} (ID: {demo_user.id})")
    
    user_id = demo_user.id
    
    
    checking_account = account_service.create_account(
        user_id=user_id,
        name="Conto Corrente Principale",
        account_type='checking',
        initial_balance=Decimal('18070.95')
    )
    
    savings_account = account_service.create_account(
        user_id=user_id,
        name="Conto Risparmio",
        account_type='savings',
        initial_balance=Decimal('45620.30')
    )
    
    investment_account = account_service.create_account(
        user_id=user_id,
        name="Conto Investimenti",
        account_type='investment',
        initial_balance=Decimal('67384.80')
    )
    
    
    mortgage_loan = loan_service.create_loan(
        user_id=user_id,
        loan_type='mortgage',
        amount=Decimal('350000.00'),
        interest_rate=Decimal('3.25'),
        term_months=360  
    )
    
    
    investments_data = [
        {'symbol': 'ENI', 'shares': Decimal('150')},
        {'symbol': 'ENEL', 'shares': Decimal('500')},
        {'symbol': 'UCG', 'shares': Decimal('80')},
        {'symbol': 'RACE', 'shares': Decimal('5')},
        {'symbol': 'FTSE-MIB', 'shares': Decimal('200')}
    ]
    
    for inv_data in investments_data:
        try:
            investment_service.buy_investment(
                user_id=user_id,
                symbol=inv_data['symbol'],
                shares=str(inv_data['shares']),
                account_id=investment_account.id
            )
        except Exception as e:
            print(f"Warning: Could not create investment {inv_data['symbol']}: {e}")
    
    
    create_transaction_history(user_id, [checking_account.id, savings_account.id, investment_account.id])
    
    return demo_user


def create_transaction_history(user_id: str, account_ids: list):
    
    transaction_repository = container.get('transaction_repository')
    
    
    categories = {
        'Alimentari': {'range': (20, 150), 'frequency': 0.3, 'type': 'expense'},
        'Carburante': {'range': (40, 80), 'frequency': 0.15, 'type': 'expense'},
        'Ristoranti': {'range': (25, 120), 'frequency': 0.2, 'type': 'expense'},
        'Utilities': {'range': (80, 200), 'frequency': 0.1, 'type': 'expense'},
        'Shopping': {'range': (30, 300), 'frequency': 0.15, 'type': 'expense'},
        'Stipendio': {'range': (2500, 3500), 'frequency': 0.05, 'type': 'income'},
        'Bonus': {'range': (500, 1500), 'frequency': 0.02, 'type': 'income'},
        'Investimenti': {'range': (100, 2000), 'frequency': 0.03, 'type': 'mixed'}
    }
    
    
    start_date = datetime.now() - timedelta(days=90)
    
    for i in range(100):  
        transaction_date = start_date + timedelta(
            days=random.randint(0, 90),
            hours=random.randint(8, 20),
            minutes=random.randint(0, 59)
        )
        
        category = random.choice(list(categories.keys()))
        cat_info = categories[category]
        amount_range = cat_info['range']
        
        
        if cat_info['type'] == 'expense':
            amount = -Decimal(str(random.uniform(amount_range[0], amount_range[1]))).quantize(Decimal('0.01'))
        elif cat_info['type'] == 'income':
            amount = Decimal(str(random.uniform(amount_range[0], amount_range[1]))).quantize(Decimal('0.01'))
        else:  
            is_expense = random.choice([True, False])
            base_amount = Decimal(str(random.uniform(amount_range[0], amount_range[1]))).quantize(Decimal('0.01'))
            amount = -base_amount if is_expense else base_amount
        
        
        descriptions = {
            'Alimentari': ['Supermercato Esselunga', 'COOP', 'Carrefour', 'Lidl', 'Mercato Locale'],
            'Carburante': ['Eni Station', 'IP', 'Q8', 'Agip', 'Shell'],
            'Ristoranti': ['Pizzeria Da Mario', 'Trattoria del Centro', 'Sushi Bar', 'McDonald\'s', 'Osteria'],
            'Utilities': ['Enel Energia', 'Gas Naturale', 'Acquedotto', 'TIM', 'Vodafone'],
            'Shopping': ['Amazon', 'Zara', 'MediaWorld', 'Ikea', 'Farmacia'],
            'Stipendio': ['Accredito Stipendio', 'Bonifico Azienda', 'Pagamento Mensile'],
            'Bonus': ['Bonus Produttività', 'Premio Risultati', 'Rimborso Spese'],
            'Investimenti': ['Acquisto Azioni', 'Vendita Titoli', 'Dividendi', 'Commissioni Trading']
        }
        
        description = random.choice(descriptions.get(category, [f'Transazione {category}']))
        
        transaction = Transaction(
            id=str(uuid4()),
            account_id=random.choice(account_ids),
            amount=amount,
            description=description,
            category=category,
            transaction_date=transaction_date,
            created_at=transaction_date,
            reference_number=f"TXN-{transaction_date.strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}"
        )
        
        transaction_repository.create(transaction)


def seed_data():
    
    print(" Seeding application data...")
    
    
    container.initialize()
    
    
    seed_available_assets()
    
    
    create_demo_user()
    
    print("Data seeding completed!")


if __name__ == "__main__":
    seed_data()