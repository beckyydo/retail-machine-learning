################################################
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
from joblib import dump, load

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
market_share = Base.classes.market_share
stock = Base.classes.stock
store = Base.classes.store

session = Session(engine)
grocery_list = []

# Main route to render index.html
@app.route("/")
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
        user_df = pd.read_csv("data/user_df.csv")
        user_id = int(user_df.loc[user_df['email'] == email, 'user_id'])
        
        # Grab past order from 
        order = pd.read_csv("data/order_df.csv")
        order = order[order['user_id'] == user_id].sort_values('add_to_cart_order')
        # Spilt repeat orders and non-repeat orders
        repeat = order[order['reordered'] > 0]
        nonrepeat = order[order['reordered'] == 0]
        
        # Grab user past orders in kmean prediction format
        grocery_df = pd.read_csv("data/grocery_df.csv")
        user_order = grocery_df[grocery_df['user_id'] == user_id].drop('user_id', axis = 1)
        
        # Fit user_id on model, return cluster 
        kmeans = load('data/kmeans.joblib') 
        cluster_num = kmeans.predict(user_order.to_numpy())[0]
        cluster_top10 = pd.read_csv("data/cluster_top10_img.csv")
        top10 = cluster_top10[cluster_top10['cluster'] == cluster_num]
        
        # Set starting variables
        # grocery_list = []
        n = 0
        for product in top10['product_name']:
            url_list = top10.loc[top10['product_name']==product, 'img_url']
            repeat_check = repeat[repeat['product_name'] == product]
            nonrepeat_check = nonrepeat[nonrepeat['product_name'] == product]
            
            if (n==3):
                break
            elif (not repeat_check.empty):
                grocery_list.append((product,url_list))
                n = n + 1
            elif (not nonrepeat_check.empty):
                grocery_list.append((product,url_list))
                n = n + 1
            else:
                grocery_list.append((product,url_list))
                n = n + 1 
        return grocery_list
    # Function function
    recommendations(user_email)
    # Render Landing Page
    return render_template("landing.html", grocery_list = grocery_list)

@app.route("/cart")
def shopping_cart():
    print('test')
    print(grocery_list)
    return render_template('cart.html', grocery_list = grocery_list)


if __name__ == "__main__":
    app.run()