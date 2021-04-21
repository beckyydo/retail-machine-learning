# Walmart Dashboard Proposal
## Group Members: 
(1) Hanieh Babaee <br />
(2) May Lacdao <br />
(3) Ronald Clarke <br />
(4) Rebecca Pham <br />
(5) Elizabeth Martinez

## Overview
For our project we would like to look into Walmart financial data relating to stocks and sales as they respond to store locations as well as socioeconomic factors that might influence those figures. Visualizing these relationships will be helpful in observing how these factors affect sales by region and each individual store. Our goal is to create a dashboard page with multiple interactive graphs and a map that will respond to inputs relating to location and influencing factors.

## Data Sources
### Data 1
Link: https://www.kaggle.com/naresh31/walmart-recruiting-store-sales-forecasting  <br />
Data Source: Kaggle <br />
Data Type: csv <br />
SQL: Postgres <br />
Description: Store sales from 2010-2012 containing various socio economic variables, dates 
& holidays. <br />
Key Columns: Date (Weekly), Store #, Dept #, Sales, CPI, Fuel Price, Temperature, Is_Holiday <br />

### Data 2
Link: https://www.kaggle.com/aayushkandpal/walmart-inc-stock-data-19722020-latest <br />
Data Source: Kaggle <br />
Data Type: csv <br />
SQL: Postgres <br />
Description: Stock analysis for Walmart from 1972 through 2020 <br />
Key Columns: Date (Day), Open Price, Close Price <br />

### Data 3
Link:https://gist.githubusercontent.com/anonymous/83803696b0e3430a52f1/raw/29f2b252981659dfa6ad51922c8155e66ac261b2/walmart.json  <br />
Data Source: reddit.com <br />
Data Type: .json <br />
SQL: Postgres <br />
Description: Store names, timezone, and location <br />
Key Columns: ID, storeType, timeZone, openDate, name, postalCode, address1, city, state, country, latitude, longitude, phoneNumber  <br />

### Data 4
Link: https://ilsr.org/walmarts-monopolization-of-local-grocery-markets/#_edn14 <br />
Data Source: Institute for Local Self-Reliance <br />
Data Type: csv <br /> 
SQL: Postgres  <br />
Description: Market share percentage of metro or micro region <br />
Key Columns: City, State, Population, Market Share % <br />


## Data Visualization
### (1) Candlestick Stock Graph
![Candlestick Graph](images/Candlestick_Sample.PNG)

### (2) Geomap Store Location
#### Option 1
![Map Graph](images/Map_Sample.jpg)
#### Option 2
![Map Graph](images/Map2_Sample.PNG)

### (3) Weekly Sales Graph Across Years Separated by Store
![Map Graph](images/Sales_Sample.jpg)

### (4) Interactive Graph Sales vs Socioeconomic Variables (Temperature, CPI, Unemployment Rate, Fuel Price)
![Map Graph](images/Sales(2)_Sample.PNG)

## Final Design Proposal
![Dashboard Sample](images/Walmart_Sample.png)
