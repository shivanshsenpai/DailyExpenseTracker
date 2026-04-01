# Daily Expense Tracker

A modern expense tracking application with AI-powered financial insights using Django backend and React frontend.

## Features

- User authentication (signup/login)
- Add, manage, and track expenses
- Visual expense reports with charts
- AI-powered financial suggestions
- AI chat for financial advice
- Budget tracking and analysis

## Tech Stack

- **Backend**: Django, SQLite
- **Frontend**: React, Bootstrap, Recharts
- **AI**: Ollama with Llama 3.2

## Setup Instructions

### Prerequisites

1. Python 3.8+
2. Node.js 16+
3. Ollama installed

### Backend Setup

1. Navigate to the project root:

   ```bash
   cd DailyExpenseTracker
   ```

2. Create and activate virtual environment:

   ```bash
   python -m venv env
   source env/Scripts/activate  # On Windows
   # or
   source env/bin/activate     # On macOS/Linux
   ```

3. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Start the Django server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to frontend directory:

   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

### AI Setup (Ollama)

1. Install Ollama from https://ollama.ai/

2. Pull the Llama 3.2 model:

   ```bash
   ollama pull llama3.2
   ```

3. Start Ollama server:
   ```bash
   ollama serve
   ```

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Sign up for a new account or login
3. Add your expenses
4. View reports and AI suggestions
5. Chat with the AI advisor

## API Endpoints

- `POST /signup/` - User registration
- `POST /login/` - User login
- `POST /add_expense/` - Add new expense
- `GET /manage_expense/<user_id>/` - Get user expenses
- `GET /ai_suggestions/<user_id>/` - Get AI financial suggestions
- `POST /ai_chat/<user_id>/` - Chat with AI advisor

## Troubleshooting

### AI Features Not Working

1. Ensure Ollama is running: `ollama serve`
2. Check if llama3.2 model is installed: `ollama list`
3. Verify the model name in `expense/views.py` matches your installed model

### Charts Not Displaying

1. Ensure all npm packages are installed: `npm install`
2. Check browser console for errors
3. Verify expense data is being fetched correctly

### Database Issues

1. Run migrations: `python manage.py migrate`
2. Check SQLite database file exists in project root

## Contributing

Feel free to submit issues and enhancement requests!</content>
<parameter name="filePath">w:\DailyExpenseTracker\README.md
