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
prophet = Base.classes.prophet
stockforecast = Base.classes.stockforecast
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

@app.route("/api/prophet")
def prophet_route():
    data = session.query(prophet.ds, 
        prophet.trend,
        prophet.yhat_lower,
        prophet.yhat_upper,
        prophet.trend_lower,
        prophet.trend_upper,
        prophet.additive_terms,
        prophet.additive_terms_lower,
        prophet.additive_terms_upper,
        prophet.daily,
        prophet.daily_lower,
        prophet.daily_upper,
        prophet.weekly,
        prophet.weekly_lower,
        prophet.weekly_upper,
        prophet.yearly,
        prophet.yearly_lower,
        prophet.yearly_upper,
        prophet.yhat,
        prophet.y).all()
 
    prophet_df = []
    for row in data:
        output={
             'ds':row[0],
            'trend':row[1],
            'yhat_lower':row[2],
            'yhat_upper':row[3],
            'trend_lower':row[4],
            'trend_upper':row[5],
            'additive_terms':row[6],
            'additive_terms_lower':row[7],
            'additive_terms_upper':row[8],
            'daily':row[9],
            'daily_lower':row[10],
            'daily_upper':row[11],
            'weekly':row[12],
            'weekly_lower':row[13],
            'weekly_upper':row[14],
            'yearly':row[15],
            'yearly_lower':row[16],
            'yearly_upper':row[17],
            'yhat':row[18],
            'y':row[19]
        }
        prophet_df.append(output)

    return jsonify(prophet_df)


@app.route("/api/stockforecast")
def stockforecast_route():
    data = session.query(stockforecast.ds,
                    stockforecast.trend,
                    stockforecast.yhat_lower,
                    stockforecast.yhat_upper,
                    stockforecast.trend_lower,
                    stockforecast.trend_upper,
                    stockforecast.additive_terms,
                    stockforecast.additive_terms_lower,
                    stockforecast.additive_terms_upper,
                    stockforecast.daily,
                    stockforecast.daily_lower,
                    stockforecast.daily_upper,
                    stockforecast.weekly,
                    stockforecast.weekly_lower,
                    stockforecast.weekly_upper,
                    stockforecast.yearly,
                    stockforecast.yearly_lower,
                    stockforecast.yearly_upper,
                    stockforecast.yhat).all()

    stockforecast_df = []
    for row in data:
        output = {
            'ds':row[0],
            'trend':row[1],
            'yhat_lower':row[2],
            'yhat_upper':row[3],
            'trend_lower':row[4],
            'trend_upper':row[5],
            'additive_terms':row[6],
            'additive_terms_lower':row[7],
            'additive_terms_upper':row[8],
            'daily':row[9],
            'daily_lower':row[10],
            'daily_upper':row[11],
            'weekly':row[12],
            'weekly_lower':row[13],
            'weekly_upper':row[14],
            'yearly':row[15],
            'yearly_lower':row[16],
            'yearly_upper':row[17],
            'multiplicative_terms':row[18],
            'multiplicative_terms_lower':row[19],
            'multiplicative_terms_upper':row[20],
            'yhat':row[21]
        }
        stockforecast_df.append(output)

    return jsonify(stockforecast_df)


if __name__ == "__main__":
    app.run(debug=True)
