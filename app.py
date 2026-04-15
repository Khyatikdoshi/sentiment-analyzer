import re
import io
import nltk
import warnings
import pandas as pd
warnings.filterwarnings('ignore')

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

nltk.download('stopwords', quiet=True)
from nltk.corpus import stopwords

app = Flask(__name__)
CORS(app)

# ── Load model once at startup ──────────────────────────────────────────────
MODEL_PATH = './saved_model'
print("Loading model... (this takes ~15 seconds on first run)")

tokenizer  = AutoTokenizer.from_pretrained(MODEL_PATH)
model      = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
classifier = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)

print("✅ Model ready")

# ── Text cleaner ────────────────────────────────────────────────────────────
stop_words = set(stopwords.words('english'))

def clean(text):
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = text.lower().strip()
    tokens = [t for t in text.split() if t not in stop_words]
    return ' '.join(tokens)

# ── Routes ──────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    body = request.get_json()
    text = body.get('text', '').strip()

    if not text:
        return jsonify({'error': 'No text provided'}), 400
    if len(text) < 3:
        return jsonify({'error': 'Review too short'}), 400

    cleaned = clean(text)[:512]
    result  = classifier(cleaned)[0]

    label      = result['label']
    confidence = round(result['score'] * 100, 1)

    if label in ('LABEL_1', 'POSITIVE'):
        display_label = 'POSITIVE'
        emoji = '😊'
        color = 'green'
    else:
        display_label = 'NEGATIVE'
        emoji = '😞'
        color = 'red'

    return jsonify({
        'label':      display_label,
        'confidence': confidence,
        'emoji':      emoji,
        'color':      color
    })


@app.route('/batch', methods=['POST'])
def batch():
    # ── Handle CSV file upload ──────────────────────────────────────────
    if 'file' in request.files:
        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files are supported'}), 400

        try:
            df = pd.read_csv(io.StringIO(file.stream.read().decode('utf-8')))
        except Exception as e:
            return jsonify({'error': f'Could not read CSV: {str(e)}'}), 400

        # Accept 'review' or 'Review' or 'REVIEW' column
        col = next((c for c in df.columns if c.strip().lower() == 'review'), None)
        if col is None:
            return jsonify({
                'error': f'CSV must have a column named "review". Found columns: {list(df.columns)}'
            }), 400

        reviews = df[col].dropna().astype(str).tolist()

    # ── Handle JSON body (old behaviour kept for compatibility) ─────────
    elif request.is_json:
        body    = request.get_json()
        reviews = body.get('reviews', [])
    else:
        return jsonify({'error': 'Send a CSV file or JSON body'}), 400

    if not reviews:
        return jsonify({'error': 'No reviews found'}), 400

    # ── Analyse each review ─────────────────────────────────────────────
    results = []
    for r in reviews:
        cleaned = clean(str(r))[:512]

        # Skip empty reviews after cleaning
        if not cleaned:
            results.append({
                'text':       str(r)[:100],
                'label':      'UNKNOWN',
                'confidence': 0,
                'emoji':      '❓'
            })
            continue

        res     = classifier(cleaned)[0]
        label   = res['label']
        display = 'POSITIVE' if label in ('LABEL_1', 'POSITIVE') else 'NEGATIVE'
        results.append({
            'text':       str(r)[:100] + ('...' if len(str(r)) > 100 else ''),
            'label':      display,
            'confidence': round(res['score'] * 100, 1),
            'emoji':      '😊' if display == 'POSITIVE' else '😞'
        })

    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True, port=5000)