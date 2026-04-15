# 🎯 Product Review Sentiment Analyzer

An AI-powered web app that analyzes the sentiment of product reviews using a pre-trained transformer model.

## ✨ Features

- **Single Review Mode** — Paste any review and instantly get sentiment (Positive / Negative / Neutral)
- **Batch Mode** — Upload a CSV file with multiple reviews and analyze them all at once
- Built with Flask + HuggingFace Transformers
- Clean, minimal UI

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| AI Model | HuggingFace Transformers (distilbert) |
| Frontend | HTML, CSS, JavaScript |
| Data | pandas (for CSV handling) |

## 🚀 How to Run Locally

### 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/sentiment-analyzer.git
cd sentiment-analyzer

### 2. Install dependencies
pip install -r requirements.txt

### 3. Run the app
python app.py

### 4. Open in browser
Go to: http://127.0.0.1:5000

## 📂 CSV Format (for Batch Mode)

Your CSV file must have a column named `review`:

| review |
|--------|
| This product is amazing! |
| Terrible quality, waste of money |
| It was okay, nothing special |

## 📁 Project Structure

sentiment-analyzer/
├── app.py              # Flask backend + AI model
├── requirements.txt    # Python dependencies
├── index.html          # Frontend UI
├── style.css           # Styling
├── app.js              # Frontend logic
└── README.md           # This file

## ⚠️ Note

This is a development server. Do not use in production without a proper WSGI server like Gunicorn.

## 🙋 Author

Made by Khyati K Doshi