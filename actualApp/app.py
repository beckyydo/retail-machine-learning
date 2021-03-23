#################################################
# Import Dependencies
#################################################
import os
from flask import (Flask,
    render_template,
    jsonify,
    request,
    redirect)
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import func
import psycopg2

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################

from flask_sqlalchemy import SQLAlchemy
engine = create_engine("postgres://ofiglsqd:vVojrG9_zzJZCOLXz8rhKWXk6ivvYqAe@otto.db.elephantsql.com:5432/ofiglsqd", echo=False)

Base = automap_base()
Base.prepare(engine, reflect=True)

walmart = Base.classes.walmart
market_share = Base.classes.market_share
stock = Base.classes.stock
store = Base.classes.store
comparison = Base.classes.comparison
predictions = Base.classes.predictions

session = Session(engine)

# Main route to render index.html
@app.route("/")
def home():
    return render_template("index.html")

# Monthly Sales Service Routes
@app.route('/api/monthly')
def send_data():
    conn = psycopg2.connect(host='otto.db.elephantsql.com', port='5432', dbname='ofiglsqd', user='ofiglsqd', password='vVojrG9_zzJZCOLXz8rhKWXk6ivvYqAe')

    cur = conn.cursor()
    cur.execute("select year, month, sales::float from public.sales_by_period;")
        
    tmp_data = cur.fetchall()
    payload = []
    content = {}
    for result in tmp_data:
        content = {'year': result[0], 'month': result[1], 'sales': result[2]}
        payload.append(content)
        content = {}

    cur.close()

    return jsonify(payload)

# Weekly Sales Variable Interactive Service Route
@app.route("/api/walmart")
def factor_route():
    data = session.query(walmart.Store, walmart.Fuel_Price, 
                        walmart.Temperature_C, walmart.Unemployment,
                        walmart.CPI, walmart.Weekly_Sales, walmart.Holiday_Name,
                        walmart.Week_Date).all()
    # Create dictionary from pulled data
    factor_df = []
    for row in data:
        factor_dict = {'Store': row[0],'Fuel_Price': row[1], 
        'Temperature_C': row[2], 'Unemployment': row[3], 'CPI': row[4],
        'Weekly_Sales': row[5], 'Holiday_Name': row[6], 'Week_Date': row[7]}
        factor_df.append(factor_dict)
    return jsonify(factor_df)

# Stock Service Route
@app.route("/api/stock")
def stock_route():

    data= session.query(stock.Date, stock.Open, stock.High, stock.Low, stock.Close, 
    stock.Volume, stock.Color, stock.MovingAvg).all()
 
    stock_df=[]
    for row in data:
        output = {
            "dates" : row[0],
            "openingPrices":row[1],
            "highPrices": row[2],
            "lowPrices": row[3],
            "closingPrices": row[4],
            "volume":row[5],
            "colors": row[6],
            "movingAvg": row[7]}
        stock_df.append(output)
        
    return jsonify(stock_df)

# Market Share Service Route
@app.route("/api/market_share")
def market_route():
    data = session.query(market_share.CITY, market_share.STATE, market_share.Latitude, 
                        market_share.Longitude, market_share.POPULATION,
                        market_share.MARKET_SHARE).all()
    # Create dictionary from pulled data
    market_df = []
    for row in data:
        market_dict = {'City': row[0],'State': row[1], 
        'Lat': row[2], 'Lon': row[3], 'Population': row[4],
        'Share': row[5]}
        market_df.append(market_dict)
    # Sort list of dictionary by key City then State
    market_df = sorted(market_df, key=lambda k: k['City']) 
    market_df = sorted(market_df, key=lambda k: k['State']) 
    return jsonify(market_df)

@app.route("/api/store")
def store_route():
    locationData = session.query(
        store.address1, store.city, store.latitude, store.longitude).all()
    session.close()
    location = []
    for row in locationData:
        locationDict = {
            'Address': row[0], 'City': row[1], 'Latitude': row[2], 'Longitude': row[3]}
        location.append(locationDict)
    return jsonify(location)

@app.route("/api/predictions")
def predict_route():
    data = session.query(predictions.Store, predictions.Fuel_Price, 
                        predictions.Temperature_C, predictions.Unemployment,
                        predictions.CPI, predictions.Weekly_Sales, predictions.Ave_Sales,
                        predictions.Date, predictions.Proph_Label, predictions.Label).all()
    # Create dictionary from pulled data
    predict_df = []
    for row in data:
        predict_dict = {'Store': row[0],'Fuel_Price': row[1], 
        'Temperature_C': row[2], 'Unemployment': row[3], 'CPI': row[4],
        'Weekly_Sales': row[5], 'Ave_Sales': row[6], 'Date': row[7], 
        'Proph_Label': row[8], 'Label': row[9]}
        predict_df.append(predict_dict)
    return jsonify(predict_df)

@app.route("/api/comparison")
def compare_route():
    data = session.query(comparison.Store, comparison.Fuel_Price, 
                        comparison.Temperature_C, comparison.Unemployment,
                        comparison.CPI, comparison.Weekly_Sales, comparison.Ave_Sales,
                        comparison.Date, comparison.Proph_Label, comparison.Real_Label,
                        comparison.Pred_Fuel_Pric, comparison.Pred_CPI, comparison.Pred_Temp, 
                        comparison.Pred_Unem, comparison.Pred_Week_Sales, 
                        comparison.Model_Label_Pred, comparison.Model_Label_Real).all()
    # Create dictionary from pulled data
    comparison_df = []
    for row in data:
        comparison_dict = {'Store': row[0],'Fuel_Price': row[1], 
        'Temperature_C': row[2], 'Unemployment': row[3], 'CPI': row[4],
        'Weekly_Sales': row[5], 'Ave_Sales': row[6], 'Date': row[7], 
        'Proph_Label': row[8], 'Real_Label': row[9], 'Pred_Fuel_Pric': row[10], 
        'Pred_CPI': row[11], 'Pred_Temp': row[12], 'Pred_Unem': row[13], 
        'Pred_Week_Sales': row[14], 'Model_Label_Pred': row[15], 'Model_Label_Real': row[16]}
        comparison_df.append(comparison_dict)
    return jsonify(comparison_df)

if __name__ == "__main__":
    app.run()

