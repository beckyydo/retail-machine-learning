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

stock = Base.classes.stock

session = Session(engine)

# Main route to render index.html
@app.route("/")
def home():
    return render_template("index.html")

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




if __name__ == "__main__":
    app.run()

