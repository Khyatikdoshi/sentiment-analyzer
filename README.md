# 🎭 Product Review Sentiment Analyzer

An AI-powered web app that analyzes the sentiment of any text or product review — detecting whether it's **Positive**, **Negative**, or **Neutral** — powered by a pre-trained HuggingFace transformer model (DistilBERT).

---

## ✨ Features

- **Single Review Mode** — Paste any text and instantly get sentiment analysis
- **Batch Mode** — Upload a CSV file with multiple reviews and analyze them all at once
- Clean, responsive web interface
- Built with Flask + HuggingFace Transformers
- Handles data processing with pandas

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Python, Flask                           |
| AI Model   | HuggingFace Transformers (DistilBERT)   |
| Frontend   | HTML, CSS, JavaScript                   |
| Data       | pandas (for CSV batch handling)         |
| Deployment | Render / Railway / Hugging Face Spaces  |

---

## 📁 Project Structure

```
sentiment-analyzer/
│
├── app.py                # Flask backend & AI model
├── requirements.txt      # Python dependencies
├── static/               # CSS, JS, images
├── templates/            # HTML templates (Jinja2)
├── .gitignore
└── README.md
```

---

## ⚙️ Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Khyatikdoshi/sentiment-analyzer.git
cd sentiment-analyzer
```

### 2. Create a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the app
```bash
python app.py
```

### 5. Open in browser
Visit: http://localhost:5000

---

## 📂 CSV Format (for Batch Mode)

Your CSV file must have a column named `review`:

| review |
|--------|
| This product is amazing! |
| Terrible quality, waste of money |
| It was okay, nothing special |

---

## 🌐 Deployment

This app can be deployed on:

- **Render** *(recommended — free tier available)*
- **Railway**
- **Hugging Face Spaces** *(great for ML apps)*

> ⚠️ This runs a development server. For production, use a WSGI server like **Gunicorn**.

---

## 🙋‍♀️ Author

Khyati K Doshi
GitHub: [@Khyatikdoshi](https://github.com/Khyatikdoshi)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
