#################################################
# Import Dependencies
#################################################
import os
from flask import (Flask, render_template, jsonify, request, redirect)
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import func
import psycopg2
import pandas as pd
import pickle
from flask_sqlalchemy import SQLAlchemy
from dateutil.relativedelta import relativedelta
import datetime
import numpy as np

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
comparison = Base.classes.comparison
predictions = Base.classes.predictions
stock = Base.classes.stock
prophet = Base.classes.prophet
# stockforecast = Base.classes.stockforecast

session = Session(engine)

# Grocery List Recommendations
server = "grocery.cu51j1bqdgvr.us-east-2.rds.amazonaws.com"
database = "postgres"
port = "5432"
username = "postgres"
password = "postgres123"
conn = f"postgres://{username}:{password}@{server}:{port}/{database}"

# K Means Model
kmeans = pickle.load(open("actualApp/static/data/kmeansmodel.pkl", 'rb'))

# Main route to render index.html
@app.route("/overview/metric")
def overview_metric():
    # Aggregate last 2 weeks of sales
    query = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
                        .group_by(walmart.Week_Date).order_by(walmart.Week_Date.desc()).limit(3)  
    # Convert query into dataframe 
    sls_2wks = pd.read_sql(query.statement, query.session.bind)
    # Calculate increase/decrease percentage of most recent weekly sale
    margin = (sls_2wks.iloc[0,1]-sls_2wks.iloc[1,1])/sls_2wks.iloc[1,1]*100
    # Retrieve recent week date
    last_wk = sls_2wks.iloc[0,0]
    # Retrieve recent total sales
    last_sales = sls_2wks.iloc[0,1]

    # Second last week calculation
    # Margin
    margin2 = (sls_2wks.iloc[1,1]-sls_2wks.iloc[2,1])/sls_2wks.iloc[2,1]*100
    # Retrieve recent total sales
    last_sales2 = sls_2wks.iloc[1,1]

    # Calculate YTD
    curr_year = sls_2wks.iloc[0,0].year
    year_filter = f"{curr_year}-01-01"
    ly_start = f"{curr_year-1}-01-01"
    ly_end = sls_2wks.iloc[0,0] - relativedelta(years=1)
    # Pull sales from this year to current date
    query2 = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
            .group_by(walmart.Week_Date).filter(walmart.Week_Date >= year_filter)
    # Pull sales from last year to current date last year
    query3 = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
            .group_by(walmart.Week_Date).filter(walmart.Week_Date >= ly_start).filter(walmart.Week_Date <= ly_end)

    ytd_df = pd.read_sql(query2.statement, query2.session.bind)
    ytd_sum = round(ytd_df['sum_1'].sum(),2)

    ly_ytd =pd.read_sql(query3.statement, query3.session.bind)
    ly_sum = round(ly_ytd['sum_1'].sum(),2)

    # Overview Metric Dict.
    metric = ({'Margin': round(margin,2), 'Week': last_wk, 'Sales': round(last_sales,2), 
                'Diff_Margin': margin-margin2, 'Diff_Sales': last_sales-last_sales2, "YeartoDate":ytd_sum,
                'Diff_YTD': ytd_sum - ly_sum})
    return jsonify(metric)

#***************************************** 4 Weeks Sales *****************************************
@app.route("/api/weeklysales")
def weekly_sales():
    data = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
                        .group_by(walmart.Week_Date).order_by(walmart.Week_Date.desc()).limit(4)
    week_df = pd.read_sql(data.statement, data.session.bind).sort_values(by="Week_Date")
    weekly_df = []
    for i in range(len(week_df)):
        sales_dict = {'Week':week_df.iloc[i,0],'Sale':week_df.iloc[i,1]}
        weekly_df.append(sales_dict)
    return jsonify(weekly_df)

@app.route("/api/ytd_weeklysales")
def ytd_weekly_sales():
    query2 = session.query(walmart.Week_Date).order_by(walmart.Week_Date.desc()).limit(1)
    last_wk = pd.read_sql(query2.statement, query2.session.bind).iloc[0,0] - relativedelta(years=1)

    ly_4wk = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
                            .group_by(walmart.Week_Date).order_by(walmart.Week_Date.desc()).filter(walmart.Week_Date <= last_wk).limit(4)
    ly_df = pd.read_sql(ly_4wk.statement, ly_4wk.session.bind).sort_values(by="Week_Date")
    weekly_df = []
    for i in range(len(ly_df)):
        sales_dict = {'YTD_Week':ly_df.iloc[i,0],'YTD_Sale':ly_df.iloc[i,1]}
        weekly_df.append(sales_dict)
    return jsonify(weekly_df)    

#***************************************** Year to Date *****************************************            
@app.route("/api/ytdsales")
def ytd_sales():
    query = session.query(walmart.Week_Date).order_by(walmart.Week_Date.desc()).limit(1)
    ty_end = pd.read_sql(query.statement, query.session.bind).iloc[0,0]
    curr_year= ty_end.year
    ty_start = f"{curr_year}-01-01"

    query2 = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
                            .group_by(walmart.Week_Date).order_by(walmart.Week_Date.desc()).filter(walmart.Week_Date <= ty_end)\
                                .filter(walmart.Week_Date >= ty_start)
    
    ytdsales = pd.read_sql(query2.statement, query2.session.bind).sort_values(by="Week_Date")

    ytd_df = []
    for i in range(len(ytdsales)):
        sales_dict = {'Week': ytdsales.iloc[i,0],'Sale':ytdsales.iloc[i,1]}
        ytd_df.append(sales_dict)
    return jsonify(ytd_df)

@app.route("/api/ly_ytdsales")
def ly_ytd_sales():
    query = session.query(walmart.Week_Date).order_by(walmart.Week_Date.desc()).limit(1)
    ty_end = pd.read_sql(query.statement, query.session.bind).iloc[0,0] 
    ly_end = ty_end - relativedelta(years=1)
    curr_year =  ty_end.year
    ty_start = f"{curr_year}-01-01"

    query3 = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
                            .group_by(walmart.Week_Date).order_by(walmart.Week_Date.desc()).filter(walmart.Week_Date <= ty_end)\
                                .filter(walmart.Week_Date >= ty_start)

    len_ty = len(pd.read_sql(query3.statement, query3.session.bind))

    query2 = session.query(walmart.Week_Date, func.sum(walmart.Weekly_Sales))\
                            .group_by(walmart.Week_Date).order_by(walmart.Week_Date.desc()).filter(walmart.Week_Date <= ly_end).limit(len_ty)

    ly_ytdsales = pd.read_sql(query2.statement, query2.session.bind).sort_values(by="Week_Date")

    ly_ytd_df = []
    for i in range(len(ly_ytdsales)):
        sales_dict = {'Week': ly_ytdsales.iloc[i,0],'YTD_Sale':ly_ytdsales.iloc[i,1]}
        ly_ytd_df.append(sales_dict)
    return jsonify(ly_ytd_df)

@app.route("/api/top10stores")
def ty_top10stores():
    query1 = session.query(walmart.Store, walmart.Week_Date, walmart.Weekly_Sales)\
                    .order_by(walmart.Week_Date.desc(), walmart.Weekly_Sales.desc()).limit(10)
    
    top10 = []
    for row in query1:
        top10_dict = {'Store': row[0],'Sale': row[2]}
        top10.append(top10_dict)
    top10 = sorted(top10, key=lambda k: k['Sale'], reverse=False) 
    return jsonify(top10)

@app.route("/api/ytd_top10stores")
def ytd_top10stores():
    query1 = session.query(walmart.Week_Date).order_by(walmart.Week_Date.desc()).limit(1)
    ty_end = pd.read_sql(query1.statement, query1.session.bind).iloc[0,0]
    ty_start = f"{ty_end.year}-01-01"

    query2 = session.query(walmart.Store, func.sum(walmart.Weekly_Sales)).group_by(walmart.Store)\
                        .filter(walmart.Week_Date>=ty_start).filter(walmart.Week_Date<=ty_end).limit(10)

    ytd_store = []
    for row in query2:
        ytd_dict = {'Store': row[0], 'Sale': row[1]}
        ytd_store.append(ytd_dict)
    ytd_store = sorted(ytd_store, key=lambda k: k['Sale'], reverse=False) 
    return jsonify(ytd_store)

#************************************** HOME TEMPLATE **************************************
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



# **************************************** Grocery List Recommendation Service Route ****************************************
grocery_list = []
feature_list = []
# Grocery List Recommendation
def recommendations(user_email):
    email = str(user_email)
    
    # Convert e-mail to user_id
    #user_id = int(user_df.loc[user_df['email'] == email, 'user_id'])
    user_id = pd.read_sql(f"SELECT user_id FROM user_df WHERE email='{email}'",conn).iloc[0,0]

    # Grab past order from 
    order = pd.read_sql(f"SELECT * FROM order_df WHERE user_id = {user_id} ORDER BY add_to_cart_order ASC",conn)
    # Spilt repeat orders and non-repeat orders
    repeat = order[order['reordered'] > 0]
    nonrepeat = order[order['reordered'] == 0]
    
    # Grab user past orders in kmean prediction format
    user_order = pd.read_sql(f"SELECT * FROM grocery_df WHERE user_id={user_id}",conn)\
        .drop('user_id', axis = 1)
    
    # Fit user_id on model, return cluster 
    cluster_num = kmeans.predict(user_order.to_numpy())[0]
    top10 = pd.read_sql(f"SELECT * FROM cluster_top10_img WHERE cluster={cluster_num}",conn)
    
    # Set starting variables
    n = 0
    for product in repeat['product_name']:
        top10_check = top10[top10['product_name'] == product]
        if (n == 3):
            break
        elif (not top10_check.empty):
            url_list = pd.read_sql(f"SELECT img_url FROM product WHERE product='{product}'",conn).iloc[0,0]
            grocery_list.append({'product': product, 'img': url_list})
            n = n + 1

    for product in nonrepeat['product_name']:
        nonrepeat_check = nonrepeat[nonrepeat['product_name'] == product]
        if (n == 3):
            break
        elif (not nonrepeat_check.empty):
            url_list = pd.read_sql(f"SELECT img_url FROM product WHERE product='{product}'",conn).iloc[0,0]
            grocery_list.append({'product': product, 'img': url_list})
            n = n + 1

    for product in repeat['product_name']:
        if (n == 3):
            break
        else:
            url_list = pd.read_sql(f"SELECT img_url FROM product WHERE product='{product}'",conn).iloc[0,0]
            grocery_list.append({'product': product, 'img': url_list})
            n = n + 1
#    return grocery_list

def feature_2(user_email, grocery_list):
    email = str(user_email)
    # Convert e-mail to user_id
    user_id = int(pd.read_sql(f"SELECT user_id FROM user_df WHERE email='{email}'",conn).iloc[0,0])
    # Filter recommendation dataframe
    user_df = pd.read_sql(f"SELECT * FROM recommendations WHERE user_id={user_id}",conn)
    
    k=0
    grocery_check = [item['product'] for item in grocery_list]
    for product in user_df['product_name']:
        if (k==3):
            break
        elif product not in grocery_check:
            url_list = pd.read_sql(f"SELECT img_url FROM product WHERE product='{product}'",conn).iloc[0,0]
            feature_list.append({'product':product,'img':url_list})
            k=k+1
#return feature_list

@app.route("/relogin")
def relogin_page():
    grocery_list.pop(3)
    grocery_list.pop(2)
    grocery_list.pop(1)
    feature_list.pop(3)
    feature_list.pop(2)
    feature_list.pop(1)
    return render_template("login.html")

# Main route to render index.html
@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/recommendations", methods = ['POST'])
def grocery():
    # Retrieve e-mail from login
    user_email = request.form['user_email']
    # Call function
    try:
        recommendations(user_email)
        feature_2(user_email, grocery_list)
        # Render Landing Page
        return render_template("landing.html", grocery_list = grocery_list, feature_list = feature_list)
    except:
        return render_template("error.html")

@app.route("/cart")
def shopping_cart():
    return render_template('cart.html', grocery_list = grocery_list, feature_list = feature_list)

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

#******************************************** Stock Service Route ********************************************
@app.route("/api/stock")
def stock_route():

    last_row = session.query(stock.Date, stock.Open, stock.High, stock.Low, stock.Close, 
        stock.Volume, stock.Color, stock.MovingAvg).order_by(stock.Date.desc()).limit(1)
    year = pd.read_sql(last_row.statement, last_row.session.bind).iloc[0,0][0:4]
    start_date = f"{int(year)-1}-01-01"
    data = session.query(stock.Date, stock.Open, stock.High, stock.Low, stock.Close, 
    stock.Volume, stock.Color, stock.MovingAvg).filter(stock.Date>=start_date).all()
 
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
    app.run()


