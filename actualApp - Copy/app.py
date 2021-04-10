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

# walmart = Base.classes.walmart
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
@app.route("/marketshare")
def share():
    return render_template("marketshare.html") 

#****************************************STORE LOCATION****************************************
@app.route("/storelocation")
def store_location():
    return render_template("store.html") 
 

if __name__ == "__main__":
    app.run()

