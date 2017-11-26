FROM python:3

WORKDIR /app

ADD . /app

RUN pip install --trusted-host pypi.python.org -r requirements.txt

EXPOSE 80

# CMD python -m http.server 8000
CMD python /app/main_server.py

