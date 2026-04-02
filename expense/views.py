
import traceback

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import datetime
from yahoo_fin.stock_info import get_quote_table, tickers_nifty50
import json
import requests
from django.contrib.auth.hashers import make_password, check_password
from .models import UserDetail
from .models import Expense


from PIL import Image
from pdf2image import convert_from_bytes
import pandas as pd
import re
from yahoo_fin.stock_info import *
import yfinance as yf
from yahoo_fin.stock_info import tickers_nifty50

# ---------------- AUTH ---------------- #

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        fullname = data.get('FullName')
        password = data.get('Password')
        email = data.get('Email')

        if UserDetail.objects.filter(Email=email).exists():
            return JsonResponse({'message': 'Email already exists'}, status=400)

        UserDetail.objects.create(FullName=fullname, Email=email, Password=make_password(password))
        return JsonResponse({'message': 'Welcome you are now registered'}, status=201)

@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('Email')
        password = data.get('Password')

        try:
            user = UserDetail.objects.get(Email=email)

            # ✅ Hashed password check
            if check_password(password, user.Password):
                return JsonResponse({
                    'message': 'Login Successful',
                    'userId': user.id,
                    'userName': user.FullName,
                    'isAdmin': user.is_admin   # 🔥 ADD THIS
                }, status=200)

            # ✅ Legacy plaintext fallback
            if user.Password == password:
                user.Password = make_password(password)
                user.save(update_fields=['Password'])

                return JsonResponse({
                    'message': 'Login Successful',
                    'userId': user.id,
                    'userName': user.FullName,
                    'isAdmin': user.is_admin   # 🔥 ADD HERE ALSO
                }, status=200)

            return JsonResponse({'message': 'Invalid Credentials'}, status=400)

        except UserDetail.DoesNotExist:
            return JsonResponse({'message': 'Invalid Credentials'}, status=400)
#admin login 
@csrf_exempt
def admin_data(request):
    try:
        user_id = request.GET.get("userId")

        if not user_id:
            return JsonResponse({"error": "UserId required"}, status=400)

        user = UserDetail.objects.get(id=user_id)

        # 🔒 STRICT ADMIN CHECK
        if not user.is_admin:
            return JsonResponse({"error": "Unauthorized"}, status=403)

        # ❌ NEVER SEND PASSWORDS IN REAL APPS
        users = list(
            UserDetail.objects.values("id", "FullName", "Email", "RegDate", "is_admin")
        )

        expenses = list(
            Expense.objects.values(
                "id", "ExpenseItem", "ExpenseCost", "ExpenseDate", "UserID_id"
            )
        )

        return JsonResponse({
            "users": users,
            "expenses": expenses
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
# ---------------- EXPENSE CRUD ---------------- #

@csrf_exempt
def add_expense(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        user = UserDetail.objects.get(id=data.get('UserId'))

        expense_cost = data.get('ExpenseCost')
        try:
            float(expense_cost)  # Validate it's a number
        except (ValueError, TypeError):
            return JsonResponse({'message': 'Invalid expense cost'}, status=400)

        try:
            Expense.objects.create(
                UserID=user,
                ExpenseDate=data.get('NoteDate'),
                ExpenseItem=data.get('ExpenseItem'),
                ExpenseCost=expense_cost
            )
            return JsonResponse({'message': 'Expense Added successfully'}, status=201)

        except Exception as e:
            return JsonResponse({'message': 'Something Went Wrong', 'error': str(e)}, status=400)


@csrf_exempt
def manage_expense(request, user_id):
    if request.method == 'GET':
        expenses = Expense.objects.filter(UserID=user_id)
        return JsonResponse(list(expenses.values()), safe=False)


@csrf_exempt
def update_expense(request, expense_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            expense = Expense.objects.get(id=expense_id)

            expense.ExpenseItem = data.get('ExpenseItem', expense.ExpenseItem)
            
            new_cost = data.get('ExpenseCost')
            if new_cost is not None:
                try:
                    float(new_cost)  # Validate
                    expense.ExpenseCost = new_cost
                except (ValueError, TypeError):
                    return JsonResponse({'message': 'Invalid expense cost'}, status=400)

            expense_date = data.get('ExpenseDate', data.get('NoteDate', None))
            if expense_date:
                expense.ExpenseDate = expense_date

            expense.save()
            return JsonResponse({'message': 'Expense updated successfully'}, status=200)

        except Expense.DoesNotExist:
            return JsonResponse({'message': 'Expense not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': 'Failed to update expense', 'error': str(e)}, status=400)

    return JsonResponse({'message': 'Method not allowed'}, status=405)


@csrf_exempt
def delete_expense(request, expense_id):
    if request.method == 'DELETE':
        try:
            expense = Expense.objects.get(id=expense_id)
            expense.delete()
            return JsonResponse({'message': 'Expense deleted successfully'}, status=200)

        except Expense.DoesNotExist:
            return JsonResponse({'message': 'Expense not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': 'Failed to delete expense', 'error': str(e)}, status=400)

    return JsonResponse({'message': 'Method not allowed'}, status=405)


# ---------------- PASSWORD ---------------- #

@csrf_exempt
def change_password(request, user_id):
    if request.method == 'POST':
        data = json.loads(request.body)

        try:
            user = UserDetail.objects.get(id=user_id)

            if not check_password(data.get('oldPassword'), user.Password):
                return JsonResponse({'message': 'Old password is incorrect'}, status=400)

            user.Password = make_password(data.get('newPassword'))
            user.save()

            return JsonResponse({'message': 'Password changed successfully'}, status=200)

        except Exception as e:
            return JsonResponse({'message': 'Something Went Wrong', 'error': str(e)}, status=400)


# ---------------- AI SUGGESTIONS ---------------- #
@csrf_exempt
def ai_suggestions(request, user_id):
    if request.method == 'GET':
        try:
            expenses = list(
                Expense.objects.filter(UserID=user_id)
                .values('ExpenseItem', 'ExpenseCost', 'ExpenseDate')
            )

            if not expenses:
                return JsonResponse({
                    'suggestions': 'No expenses found. Add some expenses to get AI suggestions!'
                }, status=200)

            # 🔥 Calculate insights
            total = sum(float(e['ExpenseCost']) for e in expenses)
            avg = total / len(expenses)

            # Top spending items
            sorted_exp = sorted(expenses, key=lambda x: float(x['ExpenseCost']), reverse=True)
            top_items = sorted_exp[:3]

            # Format expense list
            expenses_str = "\n".join([
                f"- {e['ExpenseItem']}: ₹{e['ExpenseCost']} on {e['ExpenseDate']}"
                for e in expenses
            ])

            top_str = "\n".join([
                f"- {e['ExpenseItem']}: ₹{e['ExpenseCost']}"
                for e in top_items
            ])

            # 🔥 OPTIMIZED PROMPT FOR TINYLLAMA
            prompt = f"""
You are a smart and practical financial advisor.

User total spending: ₹{total}

Top expenses:
{top_str}

Give useful, realistic money-saving advice.

FORMAT:

💸 Spending:
Write 1 clear sentence about where most money is going.

⚠️ Problems:
- Mention 2 biggest overspending areas (use actual items)

💡 Fix:
- Give 3 practical ways to reduce spending (specific, not generic)

future advice:
- Suggest 1 smart financial habit to adopt based on their spending patterns.

📊 Budget:
Needs: ₹{round(total*0.5)}
Wants: ₹{round(total*0.3)}
Savings: ₹{round(total*0.2)}

RULES:
- Keep response LONG
- Be direct and practical
- Use complete sentences
- Do NOT leave anything incomplete
"""
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "phi3",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 450
                    }
                },
                timeout=120
            )

            if response.status_code == 200:
                result = response.json().get('response', '').strip()
                if not result:
                    result = "Unable to generate suggestions at the moment."
            else:
                result = f"AI error: {response.text}"

            return JsonResponse({'suggestions': result}, status=200)

        except requests.exceptions.RequestException:
            return JsonResponse({'error': 'AI server not responding'}, status=500)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Method not allowed'}, status=405)
# ---------------- AI CHAT ---------------- #

@csrf_exempt
def ai_chat(request, user_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '').strip()

            if not user_message:
                return JsonResponse({'error': 'Message cannot be empty'}, status=400)

            expenses = list(
                Expense.objects.filter(UserID=user_id)
                .values('ExpenseItem', 'ExpenseCost', 'ExpenseDate')
            )

            total = sum(float(e['ExpenseCost']) for e in expenses)

            if expenses:
                expenses_str = "\n".join([
                    f"- {e['ExpenseItem']}: ₹{e['ExpenseCost']} on {e['ExpenseDate']}"
                    for e in expenses
                ])
            else:
                expenses_str = "No expenses logged yet."

            prompt = f"""
You are a helpful AI financial advisor.

USER'S EXPENSE DATA:
{expenses_str}

USER'S QUESTION: {user_message}

Respond ONLY in valid JSON:
{{
  "item": "string",
  "cost": number,
  "date": "YYYY-MM-DD"
}}
"""

            # 🔥 TRY OLLAMA
            try:
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "phi3",
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=10
                )

                if response.status_code == 200:
                    reply = response.json().get('response', '').strip()

                    if reply:
                        return JsonResponse({'response': reply}, status=200)

            except Exception as e:
                print("❌ Ollama failed:", str(e))

            # 🔥 FALLBACK (IMPORTANT)
            print("⚠️ Using fallback AI")

            fallback_response = json.dumps({
                "item": user_message.split(" ")[0] if user_message else "Expense",
                "cost": 0,
                "date": datetime.date.today().strftime("%Y-%m-%d")
            })

            return JsonResponse({
                "response": fallback_response,
                "ai": "fallback"
            }, status=200)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'message': 'Method not allowed'}, status=405)

@csrf_exempt
def upload_statement(request):
    try:
        if request.method != "POST":
            return JsonResponse({
                "error": "Only POST method allowed"
            }, status=405)

        file = request.FILES.get("file")

        if not file:
            return JsonResponse({
                "error": "No file uploaded"
            }, status=400)

        print("📂 FILE RECEIVED:", file.name)

        # ✅ CSV handling
        if file.name.endswith(".csv"):
            try:
                df = pd.read_csv(file)

                print("📊 CSV HEAD:")
                print(df.head())

                transactions = []
                for _, row in df.iterrows():
                    print("ROW:", row.to_dict())

                    description = row.get("Item", "")
                    amount = row.get("Amount", 0)
                    date = row.get("Date", "")

    # SAFE amount
                    try:
                        amount = float(amount)
                    except:
                        amount = 0

                    transactions.append({
                        "description": str(description).strip(),
                        "amount": amount,
                        "date": convert_date(date)  # 🔥 pass raw, not str
                    })

                print("✅ PARSED TRANSACTIONS:", transactions)

                return JsonResponse({
                    "transactions": transactions
                })

            except Exception as e:
                return JsonResponse({
                    "error": "CSV parsing failed",
                    "details": str(e),
                    "trace": traceback.format_exc()
                }, status=500)

        else:
            return JsonResponse({
                "error": "Unsupported file format",
                "filename": file.name
            }, status=400)

    except Exception as e:
        return JsonResponse({
            "error": "Unexpected server error",
            "details": str(e),
            "trace": traceback.format_exc()
        }, status=500)
    
def parse_transactions(text):
        transactions = []

        lines = text.split("\n")

        for line in lines:
            # Example pattern (adjust later based on bank format)
            match = re.search(r"(\d{2}/\d{2}/\d{4}).*?([A-Za-z ]+).*?(\d+\.\d{2})", line)

            if match:
                date = match.group(1)
                description = match.group(2).strip()
                amount = float(match.group(3))

                transactions.append({
                    "date": date,
                    "description": description,
                    "amount": amount,
                    "category": "Uncategorized"
                })

        return transactions
       
def convert_date(date_val):
    try:
        date_str = str(date_val).strip()

        if not date_str or date_str.lower() == "nan":
            return datetime.date.today().strftime("%Y-%m-%d")

        for fmt in ("%d-%m-%Y", "%Y-%m-%d", "%d/%m/%Y"):
            try:
                return datetime.datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
            except:
                continue

        print("❌ DATE FAILED:", date_str)
        return datetime.date.today().strftime("%Y-%m-%d")

    except Exception as e:
        print("❌ HARD DATE ERROR:", date_val, str(e))
        return datetime.date.today().strftime("%Y-%m-%d")
    
    #bulk upload endpoint#
@csrf_exempt
def add_multiple_expenses(request):
    try:
        if request.method != "POST":
            return JsonResponse({"error": "Only POST allowed"}, status=405)

        data = json.loads(request.body)

        print("📥 RECEIVED DATA:", data)

        for item in data:
            user_id = item.get("UserId") or item.get("UserID") or item.get("UserID_id")

            if not user_id:
                return JsonResponse({
                    "error": "UserId missing in one of the items"
                }, status=400)

            # ✅ SAFE DATE
            expense_date = item.get("NoteDate")
            try:
                expense_date = datetime.datetime.strptime(expense_date, "%Y-%m-%d").date()
            except:
                expense_date = datetime.datetime.today().date()

            Expense.objects.create(
                ExpenseItem=item.get("ExpenseItem", "").strip(),
                ExpenseCost=str(item.get("ExpenseCost", "0")),
                ExpenseDate=expense_date,
                UserID_id=user_id
            )

        return JsonResponse({"message": "All expenses added successfully"})

    except Exception as e:
        import traceback
        return JsonResponse({
            "error": "Saving failed",
            "details": str(e),
            "trace": traceback.format_exc()
        }, status=500)




# 🔥 Hardcoded (stable)
import yfinance as yf
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# 🔥 Multi-market setup
MARKETS = {
    "NIFTY50": [
        "HDFCBANK", "ICICIBANK", "AXISBANK", "SBIN",
        "RELIANCE", "INFY", "TCS", "ITC", "LT", "KOTAKBANK"
    ],

    "NASDAQ": [
        "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA"
    ],

    "FTSE100": [
        "HSBA.L", "BP.L", "GSK.L", "VOD.L", "RIO.L"
    ],

    "FTSE250": [
        "BYG.L", "RTO.L", "MKS.L", "IHG.L"
    ]
}


@csrf_exempt
def stock_update(request):
    try:
        market = request.GET.get("market", "NIFTY50")  # default market

        # 🔥 return available markets
        if "stock_update" not in request.GET:
            return JsonResponse({
                "markets": list(MARKETS.keys()),
                "stocks": MARKETS.get(market, MARKETS["NIFTY50"])
            })

        stock_list = request.GET.getlist("stock_update")

        if not stock_list:
            return JsonResponse({
                "stocks": MARKETS.get(market, [])
            })

        data = {}

        for stock in stock_list:
            if stock not in MARKETS.get(market, []):
                data[stock] = {"error": "Invalid stock"}
                continue

            try:
                ticker = yf.Ticker(stock)

                history = ticker.history(period="1d")

                if history.empty:
                    data[stock] = {"error": "No data found"}
                    continue

                latest = history.iloc[-1]

                data[stock] = {
                    "Open": float(latest["Open"]),
                    "Close": float(latest["Close"]),
                    "Volume": int(latest["Volume"]),
                }

            except Exception as e:
                data[stock] = {"error": str(e)}

        return JsonResponse({"data": data})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)