
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
from dateutil.relativedelta import relativedelta
from datetime import date, datetime

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv(".env")

FINNHUB_API_KEY = os.getenv('FINNHUB_API_KEY')
POLYGON_API_KEY = os.getenv('POLYGON_API_KEY')

# Initialize Finnhub and Polygon clients


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/company-info/<symbol>')
def company(symbol):
    url = f'https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={FINNHUB_API_KEY}'
    response = requests.get(url)
    data = response.json()
    # print(data)
    return jsonify(data)

@app.route('/company-stock-summary/<symbol>')
def company_stock_summary(symbol):
    url = f'https://finnhub.io/api/v1/quote?symbol={symbol}&metric=all&token={FINNHUB_API_KEY}'
    response = requests.get(url)
    data = response.json()
    # print(data)
    return jsonify(data)

@app.route('/company-stock-recommendation-trends/<symbol>')
def company_stock_recommendation_trends(symbol):
    url = f'https://finnhub.io/api/v1/stock/recommendation?symbol={symbol}&metric=all&token={FINNHUB_API_KEY}'
    response = requests.get(url)
    data = response.json()
    # print(data)
    return jsonify(data)

@app.route('/company-news/<symbol>')
def company_news(symbol):
    current_date = datetime.now().strftime('%Y-%m-%d');
    old_date = date.today() - relativedelta(days=+30)
    old_date = old_date.strftime('%Y-%m-%d')
    url = f'https://finnhub.io/api/v1/company-news?symbol={symbol}&from={old_date}&to={current_date}&token={FINNHUB_API_KEY}'
    response = requests.get(url)
    data = response.json()
    # print(data)
    return jsonify(data)

@app.route('/company-chart-data/<symbol>')
def company_chart_data(symbol):
    current_date = datetime.now().strftime('%Y-%m-%d')
    old_date = date.today() - relativedelta(months=+6, days=+1)
    old_date = old_date.strftime('%Y-%m-%d')

    url = f'https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/{old_date}/{current_date}?adjusted=true&sort=asc&apiKey={POLYGON_API_KEY}'
    response = requests.get(url)
    data = response.json()
    # print(data)
    return jsonify(data)


if __name__ == '__main__':
    app.run(debug=False,port=3000)
