import eventlet
eventlet.monkey_patch()


from flask import Flask, request, jsonify ,send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash 
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from flask import Flask, request, jsonify, send_file 
import numpy as np
import cv2
from skimage.measure import label, regionprops
import uuid
from io import BytesIO
from PIL import Image
import keras
import json
from flask_socketio import SocketIO, emit, join_room, leave_room
import base64
from datetime import datetime

from config import Config
from extensions import db, jwt
from  Routes.routes import routes
from models import User

"""
********************* import lib end ************************
"""


# start app flask 
app = Flask(__name__)
CORS(app)

app.config.from_object(Config)
db.init_app(app)
jwt.init_app(app)
socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins="*")
# socketio = SocketIO(app, cors_allowed_origins="*")


routes(app)


with app.app_context():
    db.create_all()

    # Create admin user if not exists
    admin_email = 'admin@gmail.com'
    admin_password = 'admin'
    if not User.query.filter_by(email=admin_email).first():
        admin_user = User(
            first_name='Admin',
            last_name='User',
            email=admin_email,
            password=generate_password_hash(admin_password),
            is_doctor=False,
            is_admin=True
        )
        db.session.add(admin_user)
        db.session.commit()


UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)
