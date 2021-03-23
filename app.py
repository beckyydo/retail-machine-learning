#################################################
# Import Dependencies
#################################################
from flask_sqlalchemy import SQLAlchemy
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

store = Base.classes.store
session = Session(engine)


# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/store")
def store_route():
    locationData = session.query(
        store.address1, store.city, store.latitude, store.longitude).all()
    session.close()
    location = []
    for row in locationData:
        locationDict = {
            'Address': row[0], 'City': row[1], 'Latitude': row[2], 'Longitude': row[3]}
        location.append(locationDict)
    return jsonify(location)


if __name__ == "__main__":
    app.run(debug=True)
