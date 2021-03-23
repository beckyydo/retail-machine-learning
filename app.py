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

#Py file

from predictions import forecastr, determine_timeframe, get_summary_stats, validate_model, preprocessing
#################################################
# Flask Setup
#################################################
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, logger=False, engineio_logger=False)


# Log suppression
logging.getLogger('socketio').setLevel(logging.ERROR)
logging.getLogger('engineio').setLevel(logging.ERROR)
logging.getLogger('geventwebsocket.handler').setLevel(logging.ERROR)

#################################################
# Database Setup
#################################################

# engine = create_engine(
#     "postgres://ofiglsqd:vVojrG9_zzJZCOLXz8rhKWXk6ivvYqAe@otto.db.elephantsql.com:5432/ofiglsqd", echo=False)

# Base = automap_base()
# Base.prepare(engine, reflect=True)

# stock = Base.classes.stock
# session = Session(engine)

@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")


# @app.route("/api/stock")
# def stock_route():

#     data= session.query(stock.Date, stock.Open , stock.High,stock.Low,stock.Close,stock.Volume,stock.Color,stock.MovingAvg).all()
 
#     stock_df=[]
#     for row in data:
#         output = {
#             "dates" : row[0],
#             "openingPrices":row[1],
#             "highPrices": row[2],
#             "lowPrices": row[3],
#             "closingPrices": row[4],
#             "volume":row[5],
#             "colors": row[6],
#             "movingAvg": row[7]}
#         stock_df.append(output)
        
#     return jsonify(stock_df)


@socketio.on('connection_msg')
def connected(message):

    data = message
    print(data)


@socketio.on('forecast_settings')
def forecast_settings(message):

    # Initial forecast settings - the first time the user sends forecast settings through the app - will use this value in forecastr method
    build_settings = 'initial'

    # store message['data'] into a df called data
    data = message['data']

    # Keep Original Data in Exisiting Structure
    original_dataset = data[1]['data'][1]['data']

    #print("******************** ORIGINAL DATASET *****************************")
    #print(original_dataset)
    #print("******************** ORIGINAL DATASET *****************************")

    # Extract info from forecast_settings message
    time_series_data = pd.DataFrame(data[1]['data'][1]['data'])
    forecast_settings = data[0]
    freq = data[2]
    column_headers = data[1]['data'][0]

    # Format the date and metric unit
    time_unit = column_headers[0]
    print(time_unit)
    time_series_data[time_unit] = time_series_data[time_unit].apply(lambda x: pd.to_datetime(str(x)))
    metric = column_headers[1]

    # y (aka as "the original data for the metric being forecasted") will be used in the chartjs line graph
    y = time_series_data[metric].tolist()

    # Use Facebook Prophet through forecastr method
    forecast = forecastr(time_series_data,forecast_settings,column_headers,freq,build_settings)

    # Need to convert forecast back into a list / array for y, y_hat and date so it can be properly graphed with chartjs
    y_hat = forecast[0]
    dates = forecast[1]
    model = forecast[2]
    csv_export = forecast[3]
    forecasted_vals = forecast[4]
    forecasted_vals_mean = forecast[5]


    # Send data back to the client
    data_back_to_client = [dates,y_hat,y,forecast_settings,column_headers,freq,original_dataset,csv_export, forecasted_vals, forecasted_vals_mean]
    #print(data_back_to_client)


    emit('render_forecast_chart', {'data': data_back_to_client})



    # Validate Model
    #mape_score = validate_model(model,dates)

    #emit('model_validation', {'data':mape_score})


@socketio.on('update_chart_settings')
def update_chart(message):

    # This is an update to the initial forecast settings. The user has changed their settings on Step 3, so we set build_settings to update.
    build_settings = 'update'

    data = message['data']

    ### Setup variables for use in the forecastr method
    time_series_data = data[4]
    original_dataset = time_series_data
    time_series_data = pd.DataFrame(time_series_data)

    #print("********* TIME SERIES DF ****************")
    #print(time_series_data.head())
    #print("********* TIME SERIES DF ****************")

    forecast_settings = data[1]
    column_headers = data[2]
    freq = data[3]

    # Dimension and Metric
    time_unit = column_headers[0]
    metric = column_headers[1]

    # Make sure time_unit is converted to datetime in order to join in helper_v3
    time_series_data[time_unit] = time_series_data[time_unit].apply(lambda x: pd.to_datetime(str(x)))


    #print([time_unit,metric])

    # Original Data
    y = time_series_data[metric].tolist()

    # Use Facebook Prophet through forecastr method
    forecast = forecastr(time_series_data,forecast_settings,column_headers,freq,build_settings)

    # Need to convert forecast back into a list / array for y, y_hat and date so it can be properly graphed with chartjs
    y_hat = forecast[0]
    dates = forecast[1]
    model = forecast[2]
    csv_export = forecast[3]
    forecasted_vals = forecast[4]
    forecasted_vals_mean = forecast[5]

    # Send data back to the client - took out original dataset
    data_back_to_client = [dates,y_hat,y,forecast_settings,column_headers,freq,original_dataset,csv_export,forecasted_vals, forecasted_vals_mean]
    emit('render_forecast_chart', {'data': data_back_to_client})

    # Validate Model
    #mape_score = validate_model(model,dates)

    #emit('model_validation', {'data':mape_score})



@socketio.on('reset')
def reset(message):

    data = message['data']
    #print(data)


@socketio.on('send_csv')
def main(message):

    # Store message['data'] in data
    data = message['data']

    # Convert data to a pandas DataFrame
    data = pd.DataFrame(data)

    #print(data)

    # Let's do some preprocessing on this data to determine which column is the dimension vs. metric.
    column_headers = preprocessing(data)

    # Set the time unit and metrc unit names
    time_unit = column_headers[0]
    metric_unit = column_headers[1]

    # Determine whether the timeframe is daily, weekly, monthly, or yearly
    timeframe = determine_timeframe(data, time_unit)

    # Get summary statistics about original dataset
    summary_stats = get_summary_stats(data,column_headers)

    # Send original data to a list
    dimension = data[time_unit].tolist()
    metric = data[metric_unit].tolist()

    original_data = [dimension,metric]

    # Send data back to the client in the form of a label detected or text extracted.
    emit('render_uploaded_csv_data', {'data': [column_headers,message, timeframe, summary_stats,original_data]})


if __name__ == '__main__':
    socketio.run(app, log_output=False)
