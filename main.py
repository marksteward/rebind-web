#!/usr/bin/env python
import os
import base64
from flask import Flask, redirect, send_from_directory
import logging
app = Flask(__name__)

logging.basicConfig(level=logging.NOTSET)

@app.route('/')
def index():
    return 'DNS rebind test'

@app.route('/robots.txt')
def robots():
    return '', 200, {'X-Not-Rebound': 1}

@app.route('/favicon.ico')
def favicon():
    return '', 404

@app.route('/<app>')
@app.route('/<app>/')
def new_client(app):
    # Don't care about bias, but only 0-9a-z- are meaningful in hostnames
    client = base64.b64encode(os.urandom(3 * 3), altchars='aa').lower()
    return redirect('http://%s.rebind.rack.ms/%s/rebind' % (client, app))

@app.route('/iframe')
def iframe():
    return send_from_directory('.', 'iframe.htm')

@app.route('/rebind.js')
def rebind():
    return send_from_directory('.', 'rebind.js')

# Here import any targets

if __name__ == "__main__":
    app.run('0.0.0.0', 7000, processes=2)

