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
comparison = Base.classes.comparison
predictions = Base.classes.predictions
stock = Base.classes.stock2020
prophet = Base.classes.prophet
stockforecast = Base.classes.stockforecast

session = Session(engine)

# Grocery List Recommendations
server = "grocery.cu51j1bqdgvr.us-east-2.rds.amazonaws.com"
database = "postgres"
port = "5432"
username = "postgres"
password = "postgres123"
conn = f"postgres://{username}:{password}@{server}:{port}/{database}"

#path = "C:/Users/16477/OneDrive/Documents/GitHub/retail-machine-learning/actualApp/data/"
kmeans = load("./static/data/kmeans.joblib")

feature2 = pd.read_sql_table("recommendations", conn)
user_df = pd.read_sql_table("user_df", conn)
grocery_df = pd.read_sql_table("grocery_df", conn)
orders = pd.read_sql_table("order_df", conn)
cluster_top10 = pd.read_sql_table("cluster_top10_img", conn)
img_product = pd.read_sql_table("product", conn)

# Main route to render index.html
@app.route("/")
def home():
    return render_template("index.html")

# **************************************** Weekly Sales Variable Interactive Service Route ****************************************
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


# **************************************** Grocery List Recommendation Service Route ****************************************
grocery_list = []
feature_list = []
# Grocery List Recommendation
def recommendations(user_email):
    email = str(user_email)
    
    # Convert e-mail to user_id
    user_id = int(user_df.loc[user_df['email'] == email, 'user_id'])
    
    # Grab past order from 
    order = orders[orders['user_id'] == user_id].sort_values('add_to_cart_order')
    # Spilt repeat orders and non-repeat orders
    repeat = order[order['reordered'] > 0]
    nonrepeat = order[order['reordered'] == 0]
    
    # Grab user past orders in kmean prediction format
    grocery_df = pd.read_sql_table("grocery_df", conn)
    user_order = grocery_df[grocery_df['user_id'] == user_id].drop('user_id', axis = 1)
    
    # Fit user_id on model, return cluster 
    cluster_num = kmeans.predict(user_order.to_numpy())[0]
    top10 = cluster_top10[cluster_top10['cluster'] == cluster_num]
    
    # Set starting variables
    n = 0
    for product in repeat['product_name']:
        top10_check = top10[top10['product_name'] == product]
        if (n == 3):
            break
        elif (not top10_check.empty):
            url_list = img_product.loc[img_product['product'] == product].img_url.item()
            grocery_list.append({'product': product, 'img': url_list})
            n = n + 1

    for product in nonrepeat['product_name']:
        nonrepeat_check = nonrepeat[nonrepeat['product_name'] == product]
        if (n == 3):
            break
        elif (not nonrepeat_check.empty):
            url_list = img_product.loc[img_product['product'] == product].img_url.item()
            grocery_list.append({'product': product, 'img': url_list})
            n = n + 1

    for product in repeat['product_name']:
        if (n == 3):
            break
        else:
            url_list = img_product.loc[img_product['product'] == product].img_url.item()
            grocery_list.append({'product': product, 'img': url_list})
            n = n + 1
#    return grocery_list

def feature_2(user_email, user_df):
    email = str(user_email)
    # Convert e-mail to user_id
    user_id = int(user_df.loc[user_df['email'] == email, 'user_id'])
    # Filter recommendation dataframe
    user_df = feature2[feature2['user_id'] == user_id]
    
    k=0
    grocery_check = [item['product'] for item in grocery_list]
    for product in user_df['product_name']:
        if (k==3):
            break
        elif product not in grocery_check:
            url_list = img_product.loc[img_product['product'] == product].img_url.item()
            feature_list.append({'product':product,'img':url_list})
            k=k+1
#return feature_list

# Main route to render index.html
@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/recommendations", methods = ['POST'])
def grocery():
    # Retrieve e-mail from login
    user_email = request.form['user_email']
    # Call function
    recommendations(user_email)
    feature_2(user_email, user_df)
    # Render Landing Page
    return render_template("landing.html", grocery_list = grocery_list, feature_list = feature_list)

@app.route("/cart")
def shopping_cart():
    return render_template('cart.html', grocery_list = grocery_list,feature_list = feature_list)

# ****************************************Stock Close Price and Upvotes Service Route ****************************************
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

# ****************************************Time Series Forecast with FB Prophet Route ****************************************
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
            'yhat':row[18]
        }
        stockforecast_df.append(output)

    return jsonify(stockforecast_df)

if __name__ == "__main__":
    app.run()

