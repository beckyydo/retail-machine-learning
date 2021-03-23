
# Import Dependencies
import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import func

# Flask Setup
app = Flask(__name__)


# Database Setup
from flask_sqlalchemy import SQLAlchemy
engine = create_engine("postgres://ofiglsqd:vVojrG9_zzJZCOLXz8rhKWXk6ivvYqAe@otto.db.elephantsql.com:5432/ofiglsqd", echo=False)

Base = automap_base()
Base.prepare(engine, reflect=True)
print(Base.classes.keys())
stock = Base.classes.stock2020
session = Session(engine)


# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

# create route that jasonify data from elephantSql database
@app.route("/api/stock")
def stock_route():

    data= session.query(stock.Date,stock.score, stock.num_comments, stock.Open , stock.High,stock.Low,
    stock.Close,stock.Adj_Close, stock.Volume,stock.High_Low_pct, stock.ewm_5, stock.price_std_5, 
    stock.volume_Change, stock.volume_avg_5, stock.volume_Close, stock.y).all()
 
    stock_df=[]
    for row in data:
        output = {
            "dates" : row[0],
            "score":row[1],
            "comments":row[2],
            "openingPrices":row[3],
            "highPrices": row[4],
            "lowPrices": row[5],
            "closingPrices": row[6],
            "adjustClosing":row[7],
            "volume":row[8],
            "percentChange": row[9],
            "movingAvg": row[10],
            "priceStdv5": row[11],
            "volumeChange":row[12],
            "volumeAvg5":row[13],
            "volumeClose":row[14], 
            "equation": row [15]
            }
        stock_df.append(output)
        
    return jsonify(stock_df)

if __name__ == "__main__":
    app.run()

