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
comparison = Base.classes.comparison
predictions = Base.classes.predictions

session = Session(engine)

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")


# Factors Service Route
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