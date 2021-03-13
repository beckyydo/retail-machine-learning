# FINAL PROJECT - PROPOSAL

## Team Members

- Rebecca Pham
- May Lacdao
- Elizabeth Salas Martinez
- Hanieh Babaee
- Ronald Clarke

## Objective

For this project, we decided to build on our two previous projects (ETL Project and Project 2). We will be incorporating machine learning algorithms to:

1. Predict Walmart's stock price
2. Create a grocery recommendation system
3. Forecast sales

## Projects

### Stock Price Prediction

Members: May, Hanieh
Data: https://www.kaggle.com/aayushkandpal/walmart-inc-stock-data-19722020-latest
Facebook Prophet (May)

- run stock price vs date
- run stock volume vs date
- run (stock price vs volume) vs date
- graph stock data, prediction (line, area graph)

Reddit WMT Name Count (Hanieh)

- webscrap reddit, chrome driver search WMT, sort by new, inspect (3 months), count
- regression on count and stock price or volume to see if there’s a relationship
- exploratory analysis doing line graph of the count against the stock graph and see if there’s patterns

### Grocery Basket Customer Recommendations

Data: https://www.kaggle.com/heeraldedhia/groceries-dataset
Grocery List Recommendation:
Load csv file, build a clustering/classification model (Rebecca)
Webscrap/API google images, use chrome driver searching the word/food item and just taking the copy link address of the first search results, adding the csv file (Rebecca)
HTML, search a member number and the product suggestion will load (Rebecca)
Other Product Recommendations:
Additional Feature: “People Who Bought ** Also Bought \_**”
Getting a unique list of product bought, getting the next top count item that were bought with it, max 3 suggestions (Liz)

### Sales Forecasting

Data: https://www.kaggle.com/naresh31/walmart-recruiting-store-sales-forecasting
Member: Ron
Sales vs. SocioEconomic Target
Regression on Sales vs SocioEconomic Variables (No Date)
Regression to see if there’s relationship between sales and socioeconomic variables
Graph against the variables to see if there’s any relationship
Facebook Prophet Sales vs Date
If there’s no relationship above, you can use facebook prophet
Graph a line/area graph with the sales and predictions
