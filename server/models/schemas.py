

from marshmallow import Schema, fields, validate



class UserSchema(Schema):
    
    id = fields.String(dump_only=True)
    username = fields.String(required=True)
    name = fields.String(required=True)
    email = fields.Email(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CreateUserSchema(Schema):
    
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    password = fields.String(required=True, validate=validate.Length(min=6))
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)



class AccountSchema(Schema):
    
    id = fields.String(dump_only=True)
    user_id = fields.String(dump_only=True)
    name = fields.String(required=True)
    type = fields.String(required=True, validate=validate.OneOf(['checking', 'savings', 'investment', 'loan']))
    balance = fields.Decimal(places=2, as_string=False, dump_only=True)
    account_number = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CreateAccountSchema(Schema):
    
    user_id = fields.String(required=True)
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    type = fields.String(required=True, validate=validate.OneOf(['checking', 'savings', 'investment', 'loan']))
    initial_balance = fields.Decimal(places=2, as_string=False, load_default=0.00)



class InvestmentSchema(Schema):
    
    id = fields.String(dump_only=True)
    user_id = fields.String(dump_only=True)
    symbol = fields.String(required=True)
    name = fields.String(required=True)
    shares = fields.Decimal(places=4, as_string=False, required=True)
    purchase_price = fields.Decimal(places=2, as_string=False, required=True)
    current_price = fields.Decimal(places=2, as_string=False, required=True)
    purchase_date = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class AvailableAssetSchema(Schema):
    
    id = fields.String(dump_only=True)
    symbol = fields.String(required=True)
    name = fields.String(required=True)
    current_price = fields.Decimal(places=2, as_string=False, required=True)
    asset_type = fields.String(required=True)
    market = fields.String(required=True)
    currency = fields.String(required=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class BuyInvestmentSchema(Schema):
    
    userId = fields.String(required=True)
    symbol = fields.String(required=True)
    shares = fields.String(required=True)  
    accountId = fields.String(required=True)


class SellInvestmentSchema(Schema):
    
    userId = fields.String(required=True)
    symbol = fields.String(required=True)
    shares = fields.Raw(required=True)  
    accountId = fields.String(required=True)
    
    def load(self, json_data, **kwargs):
        
        data = super().load(json_data, **kwargs)
        
        if 'shares' in data:
            data['shares'] = str(data['shares'])
        return data


class LoanApplicationSchema(Schema):
    
    id = fields.String(dump_only=True)
    userId = fields.String(required=True)
    type = fields.String(required=True)
    amount = fields.String(required=True)
    purpose = fields.String(required=True)
    income = fields.String(required=True)
    employmentStatus = fields.String(required=True)
    termMonths = fields.String(required=True)
    status = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)



class LoanSchema(Schema):
    
    id = fields.String(dump_only=True)
    user_id = fields.String(dump_only=True)
    type = fields.String(required=True, validate=validate.OneOf(['personal', 'mortgage', 'auto', 'business']))
    amount = fields.Decimal(places=2, as_string=False, required=True)
    interest_rate = fields.Decimal(places=2, as_string=False, required=True)
    term_months = fields.Integer(required=True)
    monthly_payment = fields.Decimal(places=2, as_string=False, dump_only=True)
    remaining_balance = fields.Decimal(places=2, as_string=False, dump_only=True)
    status = fields.String(dump_only=True, validate=validate.OneOf(['active', 'paid_off', 'defaulted', 'pending']))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class CreateLoanSchema(Schema):
    
    user_id = fields.String(required=True)
    type = fields.String(required=True, validate=validate.OneOf(['personal', 'mortgage', 'auto', 'business']))
    amount = fields.Decimal(places=2, required=True, validate=validate.Range(min=100))
    interest_rate = fields.Decimal(places=2, required=True, validate=validate.Range(min=0, max=50))
    term_months = fields.Integer(required=True, validate=validate.Range(min=6, max=360))


class LoanApplicationSchema(Schema):
    
    id = fields.String(dump_only=True)
    userId = fields.String(required=True)
    type = fields.String(required=True)
    amount = fields.String(required=True)
    purpose = fields.String(required=True)
    income = fields.String(required=True)
    employmentStatus = fields.String(required=True)
    termMonths = fields.String(required=True)
    status = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)



class TransactionSchema(Schema):
    
    id = fields.String(dump_only=True)
    account_id = fields.String(required=True)
    amount = fields.Decimal(places=2, required=True)
    description = fields.String(required=True)
    category = fields.String(required=True)
    transaction_date = fields.DateTime(required=True)
    created_at = fields.DateTime(dump_only=True)
    reference_number = fields.String(dump_only=True)


class CreateTransactionSchema(Schema):
    
    account_id = fields.String(required=True)
    amount = fields.Decimal(places=2, required=True)
    description = fields.String(required=True, validate=validate.Length(min=1, max=200))
    category = fields.String(required=True, validate=validate.Length(min=1, max=50))



class NotificationSchema(Schema):
    
    id = fields.String(dump_only=True)
    user_id = fields.String(dump_only=True)
    title = fields.String(required=True)
    message = fields.String(required=True)
    notification_type = fields.String(required=True, validate=validate.OneOf(['info', 'success', 'warning', 'error']))
    read = fields.Boolean(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    read_at = fields.DateTime(dump_only=True, allow_none=True)


class CreateNotificationSchema(Schema):
    
    user_id = fields.String(required=True)
    title = fields.String(required=True, validate=validate.Length(min=1, max=100))
    message = fields.String(required=True, validate=validate.Length(min=1, max=500))
    notification_type = fields.String(required=True, validate=validate.OneOf(['info', 'success', 'warning', 'error']))