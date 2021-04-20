FROM heroku/miniconda

# Grab requirements.txt.
ADD ./actualApp/requirements.txt /tmp/requirements.txt

# Install dependencies
RUN pip install -qr /tmp/requirements.txt

# Add our code
ADD ./actualApp /opt/actualApp/
WORKDIR /opt/actualApp

RUN conda install scikit-learn

CMD gunicorn --bind 0.0.0.0:$PORT wsgi