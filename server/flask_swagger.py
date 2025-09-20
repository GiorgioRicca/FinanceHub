

from flask import Flask
from flask_swagger_ui import get_swaggerui_blueprint
import json


def setup_swagger_ui(app: Flask):
    
    
    
    SWAGGER_URL = '/api/docs'  
    API_URL = '/api/swagger.json'  
    
    
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,  
        API_URL,
        config={  
            'app_name': "FinanceHub API",
            'dom_id': '#swagger-ui',
            'url': API_URL,
            'layout': 'StandaloneLayout',
            'deepLinking': True,
            'displayOperationId': True,
            'defaultModelsExpandDepth': 2,
            'defaultModelExpandDepth': 2,
            'displayRequestDuration': True,
            'docExpansion': 'none',
            'filter': False,
            'showExtensions': True,
            'showCommonExtensions': True,
            'supportedSubmitMethods': ['get', 'post', 'put', 'delete', 'patch']
        }
    )
    
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
    
    
    @app.route('/api/swagger.json')
    def swagger_json():
        
        return get_openapi_spec()


def get_openapi_spec():
    
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "FinanceHub API",
            "description": "API completa per la gestione finanziaria personale con investimenti, prestiti, conti e transazioni",
            "version": "1.0.0",
            "contact": {
                "name": "FinanceHub Support",
                "email": "support@financehub.it"
            }
        },
        "servers": [
            {
                "url": "/api",
                "description": "API Server"
            }
        ],
        "tags": [
            {"name": "Dashboard", "description": "Riassunto dashboard finanziaria"},
            {"name": "Accounts", "description": "Gestione conti bancari e finanziari"},
            {"name": "Investments", "description": "Gestione portafoglio investimenti"},
            {"name": "Loans", "description": "Gestione prestiti e finanziamenti"},
            {"name": "Transactions", "description": "Gestione transazioni finanziarie"},
            {"name": "Notifications", "description": "Sistema notifiche utente"},
            {"name": "Users", "description": "Gestione utenti"}
        ],
        "paths": {
            "/dashboard/{userId}": {
                "get": {
                    "tags": ["Dashboard"],
                    "summary": "Ottiene riassunto dashboard finanziaria",
                    "description": "Restituisce il riassunto completo della situazione finanziaria dell'utente incluso saldo totale, investimenti, spese mensili e prestiti attivi",
                    "parameters": [
                        {
                            "name": "userId",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                            "description": "ID univoco dell'utente",
                            "example": "demo-user-123"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Riassunto dashboard ottenuto con successo",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/DashboardSummary"}
                                }
                            }
                        },
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/accounts/{userId}": {
                "get": {
                    "tags": ["Accounts"],
                    "summary": "Ottiene lista conti utente",
                    "description": "Restituisce tutti i conti bancari e finanziari associati all'utente",
                    "parameters": [
                        {
                            "name": "userId",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                            "description": "ID univoco dell'utente",
                            "example": "demo-user-123"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Lista conti ottenuta con successo",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/Account"}
                                    }
                                }
                            }
                        },
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/investments/{userId}": {
                "get": {
                    "tags": ["Investments"],
                    "summary": "Ottiene portafoglio investimenti utente",
                    "description": "Restituisce tutti gli investimenti nel portafoglio dell'utente con prezzi aggiornati",
                    "parameters": [
                        {
                            "name": "userId",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                            "description": "ID univoco dell'utente",
                            "example": "demo-user-123"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Portafoglio investimenti ottenuto con successo",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/Investment"}
                                    }
                                }
                            }
                        },
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/assets": {
                "get": {
                    "tags": ["Investments"],
                    "summary": "Ottiene asset disponibili per trading",
                    "description": "Restituisce tutti gli asset finanziari disponibili per l'acquisto e vendita",
                    "responses": {
                        "200": {
                            "description": "Lista asset disponibili ottenuta con successo",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/AvailableAsset"}
                                    }
                                }
                            }
                        },
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/investments/buy": {
                "post": {
                    "tags": ["Investments"],
                    "summary": "Acquista investimento",
                    "description": "Acquista azioni o altri strumenti finanziari utilizzando i fondi disponibili nel conto specificato",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/BuyInvestmentRequest"}
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Investimento acquistato con successo",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/InvestmentResponse"}
                                }
                            }
                        },
                        "400": {"$ref": "#/components/responses/BadRequest"},
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/investments/sell": {
                "post": {
                    "tags": ["Investments"],
                    "summary": "Vende investimento",
                    "description": "Vende azioni o altri strumenti finanziari dal portafoglio e accredita i proventi nel conto specificato",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/SellInvestmentRequest"}
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Investimento venduto con successo",
                            "content": {
                                "application/json": {
                                    "schema": {"$ref": "#/components/schemas/InvestmentResponse"}
                                }
                            }
                        },
                        "400": {"$ref": "#/components/responses/BadRequest"},
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/loans/{userId}": {
                "get": {
                    "tags": ["Loans"],
                    "summary": "Ottiene prestiti utente",
                    "description": "Restituisce tutti i prestiti associati all'utente con dettagli di rimborso",
                    "parameters": [
                        {
                            "name": "userId",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                            "description": "ID univoco dell'utente",
                            "example": "demo-user-123"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Lista prestiti ottenuta con successo",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/Loan"}
                                    }
                                }
                            }
                        },
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/transactions/recent/{userId}": {
                "get": {
                    "tags": ["Transactions"],
                    "summary": "Ottiene transazioni recenti utente",
                    "description": "Restituisce le transazioni più recenti dell'utente su tutti i conti",
                    "parameters": [
                        {
                            "name": "userId",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                            "description": "ID univoco dell'utente",
                            "example": "demo-user-123"
                        },
                        {
                            "name": "limit",
                            "in": "query",
                            "required": False,
                            "schema": {"type": "integer", "default": 50},
                            "description": "Numero massimo di transazioni da restituire"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Transazioni recenti ottenute con successo",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/Transaction"}
                                    }
                                }
                            }
                        },
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/notifications/{userId}": {
                "get": {
                    "tags": ["Notifications"],
                    "summary": "Ottiene notifiche utente",
                    "description": "Restituisce tutte le notifiche per l'utente specificato",
                    "parameters": [
                        {
                            "name": "userId",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                            "description": "ID univoco dell'utente",
                            "example": "demo-user-123"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Notifiche ottenute con successo",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/Notification"}
                                    }
                                }
                            }
                        },
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            },
            "/notifications/{userId}/unread": {
                "get": {
                    "tags": ["Notifications"],
                    "summary": "Ottiene notifiche non lette",
                    "description": "Restituisce solo le notifiche non lette per l'utente specificato",
                    "parameters": [
                        {
                            "name": "userId",
                            "in": "path",
                            "required": True,
                            "schema": {"type": "string"},
                            "description": "ID univoco dell'utente",
                            "example": "demo-user-123"
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Notifiche non lette ottenute con successo",
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "array",
                                        "items": {"$ref": "#/components/schemas/Notification"}
                                    }
                                }
                            }
                        },
                        "500": {"$ref": "#/components/responses/ServerError"}
                    }
                }
            }
        },
        "components": {
            "schemas": {
                "DashboardSummary": {
                    "type": "object",
                    "properties": {
                        "totalBalance": {"type": "string", "example": "128435.60", "description": "Saldo totale di tutti i conti (esclusi prestiti)"},
                        "totalInvestments": {"type": "string", "example": "15991.50", "description": "Valore totale del portafoglio investimenti"},
                        "monthlyExpenses": {"type": "string", "example": "2150.30", "description": "Spese totali del mese corrente"},
                        "activeLoanBalance": {"type": "string", "example": "387500.00", "description": "Saldo residuo di tutti i prestiti attivi"},
                        "investmentGrowth": {"type": "string", "example": "+8.7%", "description": "Crescita percentuale degli investimenti"},
                        "expenseVariation": {"type": "string", "example": "-15.2%", "description": "Variazione spese rispetto al mese precedente"},
                        "activeLoansCount": {"type": "integer", "example": 2, "description": "Numero di prestiti attivi"}
                    }
                },
                "Account": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "example": "uuid-123"},
                        "user_id": {"type": "string", "example": "demo-user-123"},
                        "name": {"type": "string", "example": "Conto Corrente Principale"},
                        "type": {"type": "string", "enum": ["checking", "savings", "investment", "loan"], "example": "checking"},
                        "balance": {"type": "string", "example": "18070.95"},
                        "account_number": {"type": "string", "example": "IT60X0542811101000000123456"},
                        "created_at": {"type": "string", "format": "date-time"},
                        "updated_at": {"type": "string", "format": "date-time"}
                    }
                },
                "Investment": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "example": "uuid-456"},
                        "user_id": {"type": "string", "example": "demo-user-123"},
                        "symbol": {"type": "string", "example": "ENI"},
                        "name": {"type": "string", "example": "Eni S.p.A."},
                        "shares": {"type": "string", "example": "150.0000"},
                        "purchase_price": {"type": "string", "example": "13.45"},
                        "current_price": {"type": "string", "example": "14.82"},
                        "purchase_date": {"type": "string", "format": "date-time"},
                        "updated_at": {"type": "string", "format": "date-time"}
                    }
                },
                "AvailableAsset": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "example": "uuid-789"},
                        "symbol": {"type": "string", "example": "ENEL"},
                        "name": {"type": "string", "example": "Enel S.p.A."},
                        "current_price": {"type": "string", "example": "6.98"},
                        "asset_type": {"type": "string", "example": "Azione"},
                        "market": {"type": "string", "example": "Borsa Italiana"},
                        "currency": {"type": "string", "example": "EUR"},
                        "created_at": {"type": "string", "format": "date-time"},
                        "updated_at": {"type": "string", "format": "date-time"}
                    }
                },
                "BuyInvestmentRequest": {
                    "type": "object",
                    "required": ["userId", "symbol", "shares", "accountId"],
                    "properties": {
                        "userId": {"type": "string", "example": "demo-user-123"},
                        "symbol": {"type": "string", "example": "ENI"},
                        "shares": {"type": "string", "example": "100"},
                        "accountId": {"type": "string", "example": "uuid-account-123"}
                    }
                },
                "SellInvestmentRequest": {
                    "type": "object",
                    "required": ["userId", "symbol", "shares", "accountId"],
                    "properties": {
                        "userId": {"type": "string", "example": "demo-user-123"},
                        "symbol": {"type": "string", "example": "ENI"},
                        "shares": {"type": "string", "example": "50"},
                        "accountId": {"type": "string", "example": "uuid-account-123"}
                    }
                },
                "InvestmentResponse": {
                    "type": "object",
                    "properties": {
                        "message": {"type": "string", "example": "Investment operation completed successfully"},
                        "investment": {"$ref": "#/components/schemas/Investment"},
                        "transaction": {"$ref": "#/components/schemas/Transaction"}
                    }
                },
                "Loan": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "example": "uuid-loan-123"},
                        "user_id": {"type": "string", "example": "demo-user-123"},
                        "type": {"type": "string", "enum": ["personal", "mortgage", "auto", "business"], "example": "mortgage"},
                        "amount": {"type": "string", "example": "350000.00"},
                        "interest_rate": {"type": "string", "example": "3.25"},
                        "term_months": {"type": "integer", "example": 360},
                        "monthly_payment": {"type": "string", "example": "1521.45"},
                        "remaining_balance": {"type": "string", "example": "325000.00"},
                        "status": {"type": "string", "enum": ["active", "paid_off", "defaulted", "pending"], "example": "active"},
                        "created_at": {"type": "string", "format": "date-time"},
                        "updated_at": {"type": "string", "format": "date-time"}
                    }
                },
                "Transaction": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "example": "uuid-txn-123"},
                        "account_id": {"type": "string", "example": "uuid-account-123"},
                        "amount": {"type": "string", "example": "-85.50"},
                        "description": {"type": "string", "example": "Supermercato Esselunga"},
                        "category": {"type": "string", "example": "Alimentari"},
                        "transaction_date": {"type": "string", "format": "date-time"},
                        "created_at": {"type": "string", "format": "date-time"},
                        "reference_number": {"type": "string", "example": "TXN-20241019120000"}
                    }
                },
                "Notification": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string", "example": "uuid-notif-123"},
                        "user_id": {"type": "string", "example": "demo-user-123"},
                        "title": {"type": "string", "example": "Investimento Acquistato"},
                        "message": {"type": "string", "example": "Acquistate 100 azioni di ENI per €1,482.00"},
                        "notification_type": {"type": "string", "enum": ["info", "success", "warning", "error"], "example": "success"},
                        "read": {"type": "boolean", "example": False},
                        "created_at": {"type": "string", "format": "date-time"},
                        "read_at": {"type": "string", "format": "date-time", "nullable": True}
                    }
                }
            },
            "responses": {
                "BadRequest": {
                    "description": "Richiesta non valida",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string", "example": "Invalid request parameters"}
                                }
                            }
                        }
                    }
                },
                "ServerError": {
                    "description": "Errore interno del server",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string", "example": "Internal server error"}
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return spec