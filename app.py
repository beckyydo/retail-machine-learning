#################################################
# Import Dependencies
#################################################
# Flask
from flask_sqlalchemy import SQLAlchemy
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask_cors import CORS, cross_origin

# OS, Pandas
import os
import pandas as pd
import numpy as np
import datetime
import requests
import matplotlib.pyplot as plt
import time

# SQLAlchemy
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import func

# FB Prophet
from fbprophet import Prophet

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Database Setup
#################################################

engine = create_engine(
    "postgres://ofiglsqd:vVojrG9_zzJZCOLXz8rhKWXk6ivvYqAe@otto.db.elephantsql.com:5432/ofiglsqd", echo=False)

Base = automap_base()
Base.prepare(engine, reflect=True)

stock = Base.classes.stock
priceMetrics = Base.classes.priceMetrics
actualPrice = Base.classes.actual_stock_price
stockPredictions = Base.classes.stockPredictions
priceCV = Base.classes.priceCrossVal

session = Session(engine)


# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/stock")
def stock_route():

    data= session.query(stock.Date, stock.Close).all()
 
    stock_df=[]
    for row in data:
        output = {
            "closingPrice" : row[1],
            "date":row[0]}
        stock_df.append(output)
        
    return jsonify(stock_df)

@app.route("/api/priceMetrics")
def metrics_route():
    data = session.query(priceMetrics.horizon, priceMetrics.mse, priceMetrics.rmse, priceMetrics.mae, priceMetrics.mape, priceMetrics.mdape, priceMetrics.coverage)

    price_metrics = []
    for row in data:
        output = {
            "horizon":row[0],
            "mse":row[1],
            "rmse":row[2],
            "mae":row[3],
            "mape":row[4],
            "mdape":row[5],
            "coverage":row[6]
        }
        price_metrics.append(output)

    return jsonify(price_metrics)


if __name__ == "__main__":
    app.run(debug=True)
