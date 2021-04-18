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
market_share = Base.classes.market_share
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
    # Overview Metric Dict.
    metric = ({'Margin': round(margin,2), 'Week': last_wk, 'Sales': round(last_sales,2), 
                'Diff_Margin': margin-margin2, 'Diff_Sales': last_sales-last_sales2})
    return jsonify(metric)


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



if __name__ == "__main__":
    app.run()

