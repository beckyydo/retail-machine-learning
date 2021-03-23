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
from flask_socketio import SocketIO, emit

# OS, Pandas
import os
import pandas as pd
import numpy as np
import datetime
import requests
import matplotlib.pyplot as plt
import time
import logging

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
session = Session(engine)


# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/stock")
def stock_route():

    data= session.query(stock.Date, stock.Open , stock.High,stock.Low,stock.Close,stock.Volume,stock.Color,stock.MovingAvg).all()
 
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


if __name__ == "__main__":
    app.run(debug=True)
