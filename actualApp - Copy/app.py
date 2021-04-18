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
import pandas as pd
import pickle
from joblib import dump, load
from flask_sqlalchemy import SQLAlchemy

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################
engine = create_engine("postgres://ofiglsqd:vVojrG9_zzJZCOLXz8rhKWXk6ivvYqAe@otto.db.elephantsql.com:5432/ofiglsqd", echo=False)

Base = automap_base()
Base.prepare(engine, reflect=True)

walmart = Base.classes.walmart
market_share = Base.classes.market_share
# comparison = Base.classes.comparison
# predictions = Base.classes.predictions
# stock = Base.classes.stock2020
# prophet = Base.classes.prophet
# stockforecast = Base.classes.stockforecast

session = Session(engine)

# Grocery List Recommendations
# server = "grocery.cu51j1bqdgvr.us-east-2.rds.amazonaws.com"
# database = "postgres"
# port = "5432"
# username = "postgres"
# password = "postgres123"
# conn = f"postgres://{username}:{password}@{server}:{port}/{database}"

#path = "C:/Users/16477/OneDrive/Documents/GitHub/retail-machine-learning/actualApp/data/"
# kmeans = load("./static/data/kmeans.joblib")

# feature2 = pd.read_sql_table("recommendations", conn)
# user_df = pd.read_sql_table("user_df", conn)
# grocery_df = pd.read_sql_table("grocery_df", conn)
# orders = pd.read_sql_table("order_df", conn)
# cluster_top10 = pd.read_sql_table("cluster_top10_img", conn)
# img_product = pd.read_sql_table("product", conn)

# Main route to render index.html
@app.route("/overview/metric")
def overview_metric():
    # Aggregate last 2 weeks of sales
    query = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
                        .group_by(walmart.Week_Date).order_by(walmart.Week_Date.desc()).limit(2)  
    # Convert query into dataframe 
    sls_2wks = pd.read_sql(query.statement, query.session.bind)
    # Calculate increase/decrease percentage of most recent weekly sale
    margin = (sls_2wks.iloc[0,1]-sls_2wks.iloc[1,1])/sls_2wks.iloc[1,1]*100
    # Retrieve recent week date
    last_wk = sls_2wks.iloc[0,0]
    # Retrieve recent total sales
    last_sales = sls_2wks.iloc[0,1]
    # Overview Metric Dict.
    metric = ({'Margin': margin, 'Week': last_wk, 'Sales':last_sales})
    return jsonify(metric)


@app.route("/")
def home():
    return render_template("index.html")

#*********************************WEEKLY SALES FORECASTING*********************************
@app.route("/forecasting")
def forecast():
    return render_template("forecast.html")  

#******************************************STOCKS******************************************
@app.route("/stock/market")
def stock_market():
    return render_template("stock_market.html") 

@app.route("/stock/forecast")
def stock_forecast():
    return render_template("stock_forecast.html")   

#****************************************MARKETSHARE****************************************
@app.route("/api/marketshare")
def share_api():
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

@app.route("/marketshare")
def share():
    return render_template("marketshare.html") 

#****************************************STORE LOCATION****************************************
@app.route("/storelocation")
def store_location():
    return render_template("store.html") 
 

if __name__ == "__main__":
    app.run()

