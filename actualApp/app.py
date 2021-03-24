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

session = Session(engine)

# Grocery List Recommendations
server = "grocery.cu51j1bqdgvr.us-east-2.rds.amazonaws.com"
database = "postgres"
port = "5432"
username = "postgres"
password = "postgres123"
conn = f"postgres://{username}:{password}@{server}:{port}/{database}"

#path = "C:/Users/16477/OneDrive/Documents/GitHub/retail-machine-learning/actualApp/"
#kmeans= load(path+"kmeans.joblib")
user_df = pd.read_sql_table("user_df", conn)
grocery_df = pd.read_sql_table("grocery_df", conn)
orders = pd.read_sql_table("order_df", conn)
cluster_top10 = pd.read_sql_table("cluster_top10_img", conn)

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

# Main route to render index.html
@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/recommendations", methods = ['POST'])
def grocery():
    # Retrieve e-mail from login
    user_email = request.form['user_email']
    # Create recommendation function
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
        for product in top10['product_name']:
            url_list = top10.loc[top10['product_name'] == product].img_url.item()
            repeat_check = repeat[repeat['product_name'] == product]
            nonrepeat_check = nonrepeat[nonrepeat['product_name'] == product]

            if (n==3):
                break
            elif (not repeat_check.empty):
                grocery_list.append({'product': product, 'img': url_list})
                n = n + 1
            elif (not nonrepeat_check.empty):
                grocery_list.append({'product': product, 'img': url_list})
                n = n + 1
            else:
                grocery_list.append({'product': product, 'img': url_list})
                n = n + 1 
        return grocery_list
    # Call function
    recommendations(user_email)
    # Render Landing Page
    return render_template("landing.html", grocery_list = grocery_list)

@app.route("/cart")
def shopping_cart():
    return render_template('cart.html', grocery_list = grocery_list)



if __name__ == "__main__":
    app.run()

