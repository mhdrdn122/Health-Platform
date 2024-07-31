"""
********************* import lib start ************************
"""

import eventlet


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

"""
********************* import lib end ************************
"""
eventlet.monkey_patch()


# start app flask 
app = Flask(__name__)
CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")





"""
********************* config and model mysqlalchemy start ************************
"""
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/chatapp'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'supersecretkey'
app.config['UPLOAD_FOLDER'] = 'uploads/'

db = SQLAlchemy(app)
jwt = JWTManager(app)

class Specialty(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    
    def __repr__(self):
        return f'<Specialty {self.name}>'

class ProfilePic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.LargeBinary(length=(2**32)-1), nullable=False)
    name = db.Column(db.String(250), nullable=False)
    mimetype = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return f'<ProfilePic {self.name}>'
    
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_doctor = db.Column(db.Boolean, nullable=False)
    specialty_id = db.Column(db.Integer, db.ForeignKey('specialty.id'))
    specialty = db.relationship('Specialty', backref=db.backref('users', lazy=True))
    bio = db.Column(db.String(500), default='السيرة الذاتية')
    profile_pic_id = db.Column(db.Integer, db.ForeignKey('profile_pic.id'))
    profile_pic = db.relationship('ProfilePic', backref=db.backref('users', lazy=True))
    is_admin = db.Column(db.Boolean, default=False)
    last_seen = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
    
    def __repr__(self):
        return f'<User {self.first_name} {self.last_name}>'
    
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=True)
    file_data = db.Column(db.LargeBinary(length=(2**32)-1), nullable=True)
    file_name = db.Column(db.String(250), nullable=True)
    file_type = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
    sender_deleted = db.Column(db.Boolean, default=False)
    receiver_deleted = db.Column(db.Boolean, default=False)
    edited = db.Column(db.Boolean, default=False)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(150), nullable=False)
    patient_phone = db.Column(db.String(20), nullable=False)
    patient_gender = db.Column(db.String(10), nullable=False)
    datetime = db.Column(db.DateTime, nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_approved = db.Column(db.Boolean, nullable=False, default=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    doctor = db.relationship('User', backref=db.backref('appointments', lazy=True))

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    user = db.relationship('User', backref=db.backref('notifications', lazy=True))

    def __repr__(self):
        return f'<Notification {self.message}>'

"""
********************* Notification start ************************
"""
@app.route('/notifications', methods=['POST'])
@jwt_required()
def create_notification():
    print("test")
    user_id = request.json.get('user_id')
    message = request.json.get('message')
    notification = Notification(user_id=user_id, message=message)
    db.session.add(notification)
    db.session.commit()
    socketio.emit('notification', {'user_id': user_id, 'message': message})
    return jsonify({"message": "Notification sent"}), 200

@app.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = request.args.get('user_id')
    notifications = Notification.query.filter_by(user_id=user_id).all()

    for notification in notifications:
        notification.is_read = True
    db.session.commit()

    return jsonify([{
        "id": notification.id,
        "message": notification.message,
        "timestamp": notification.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        "is_read": notification.is_read
    } for notification in notifications])


@app.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_as_read(notification_id):
    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
    
    notification.is_read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read"}), 200


"""
********************* Notification End ************************
"""




"""
********************* Appointment start ************************
"""
@app.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    data = request.get_json()
    patient_name = data.get('patient_name')
    patient_phone = data.get('patient_phone')
    patient_gender = data.get('patient_gender')
    doctor_id = data.get('doctor_id')
    datetime_str = data.get('datetime')
    is_approved = data.get('is_approved')

    print(patient_name)
    print(patient_phone)
    print(patient_gender)
    print(doctor_id)
    print(datetime_str)
    print(is_approved)


    if not patient_name or not patient_phone or not patient_gender or not doctor_id or not datetime_str:
        return jsonify({"error": "Missing required parameters"}), 400

    # datetime_obj = datetime.datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')

    # تحقق من عدم وجود موعد في نفس الوقت لنفس الطبيب
    existing_appointment = Appointment.query.filter_by(doctor_id=doctor_id, datetime=datetime_str).first()
    if existing_appointment:
        return jsonify({"error": "Doctor already has an appointment at this time"}), 400

    appointment = Appointment(
        patient_name=patient_name, 
        patient_phone=patient_phone, 
        patient_gender=patient_gender, 
        doctor_id=doctor_id, 
        datetime=datetime_str
    )
    db.session.add(appointment)
    db.session.commit()

    return jsonify({"message": "Appointment created successfully"}), 201


@app.route('/appointments/doctor/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_appointments_by_doctor(doctor_id):
    print("Fetching appointments for doctor:", doctor_id)
    appointments = Appointment.query.filter_by(doctor_id=doctor_id).all()
    if not appointments:
        return jsonify({"error": "No appointments found"}), 404

    return jsonify([{
        "id": appointment.id,
        "patient_name": appointment.patient_name,
        "patient_phone": appointment.patient_phone,
        "patient_gender": appointment.patient_gender,
        "datetime": appointment.datetime.strftime('%Y-%m-%d %H:%M:%S'),
        "is_approved": appointment.is_approved,
        "is_completed": appointment.is_completed

    } for appointment in appointments])

@app.route('/appointments/<int:appointment_id>/toggle_complete', methods=['PUT'])
@jwt_required()
def toggle_complete_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    appointment.is_completed = not appointment.is_completed
    db.session.commit()

    return jsonify({"message": "Appointment updated successfully", "is_completed": appointment.is_completed}), 200

@app.route('/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def delete_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    db.session.delete(appointment)
    db.session.commit()

    return jsonify({"message": "Appointment deleted successfully"}), 200


@app.route('/appointments/<int:appointment_id>/approve', methods=['PUT'])
@jwt_required()
def approve_appointment(appointment_id):
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"error": "Appointment not found"}), 404

    appointment.is_approved = not appointment.is_approved
    db.session.commit()

    return jsonify({"message": "Appointment updated successfully", "is_approved": appointment.is_approved}), 200


@app.route('/appointments', methods=['GET'])
@jwt_required()
def get_all_appointments():
    appointments = Appointment.query.all()
    if not appointments:
        return jsonify({"error": "No appointments found"}), 404

    return jsonify([{
        "id": appointment.id,
        "patient_name": appointment.patient_name,
        "patient_phone": appointment.patient_phone,
        "patient_gender": appointment.patient_gender,
        "datetime": appointment.datetime.strftime('%Y-%m-%d %H:%M:%S'),
        "doctor_id": appointment.doctor_id,
        "doctor_name": f"{appointment.doctor.first_name} {appointment.doctor.last_name}",
        "is_approved": appointment.is_approved
    } for appointment in appointments])




"""
********************* Appointment end ************************
"""


"""
********************* socket start ************************
"""





@app.route('/delete_message', methods=['POST'])
def delete_message():
    data = request.get_json()
    message_id = data['message_id']
    user_id = data['user_id']
    message = Message.query.get(message_id)
    if not message:
        return jsonify({"message": "Message not found"}), 404

    if message.sender_id == user_id:
        db.session.delete(message)
        db.session.commit()
    else:
        if message.receiver_id == user_id:
            message.receiver_deleted = True
        elif message.sender_id == user_id:
            message.sender_deleted = True
        db.session.commit()
    return jsonify({"message": "Message deleted successfully"})


@app.route('/edit_message', methods=['POST'])
def edit_message():
    data = request.get_json()
    message_id = data.get('message_id')
    new_content = data.get('new_content')
    user_id = data.get('user_id')
    print(message_id)
    print("new_content", new_content)

    if not message_id or not new_content or not user_id:
        return jsonify({"message": "Invalid data"}), 400

    message = Message.query.get(message_id)
    if not message:
        return jsonify({"message": "Message not found"}), 404

    if message.sender_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    try:
        message.content = new_content
        message.edited = True
        db.session.commit()

        room = get_room_name(message.sender_id, message.receiver_id)
        socketio.emit('message_edited', {
            'id': message.id,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'content': message.content,
            'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'edited': message.edited
        }, room=room)

        return jsonify({"message": "Message edited successfully"})
    except Exception as e:
        print(f"Error editing message: {e}")
        return jsonify({"message": f"Internal server error: {e}"}), 500
    
@app.route('/messages', methods=['POST',"GET"])
def get_messages():
    print("test2")
    data = request.get_json()
    sender_id = data['sender_id']
    receiver_id = data['receiver_id']
    messages = Message.query.filter(
        ((Message.sender_id == sender_id) & (Message.receiver_id == receiver_id) & (Message.sender_deleted == False)) |
        ((Message.sender_id == receiver_id) & (Message.receiver_id == sender_id) & (Message.receiver_deleted == False))
    ).order_by(Message.timestamp).all()

    return jsonify([{
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "file_data": base64.b64encode(msg.file_data).decode('utf-8') if msg.file_data else None,
        "file_name": msg.file_name,
        "file_type": msg.file_type,
        "timestamp": msg.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    } for msg in messages])

from datetime import datetime
@app.route('/update_last_seen', methods=['POST'])
def update_last_seen():
    data = request.get_json()
    user_id = data['user_id']
    user = User.query.get(user_id)
    if user:
        user.last_seen = datetime.datetime.utcnow()
        db.session.commit()
        return jsonify({"message": "Last seen updated"}), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/user_status/<int:user_id>', methods=['GET'])
def get_user_status(user_id):
    print("test")
    user = User.query.get(user_id)
    if user:
        now = datetime.datetime.utcnow()
        last_seen = user.last_seen
        status = "Online" if (now - last_seen).total_seconds() < 60 else f"Last seen at {last_seen}"
        return jsonify({"status": status}), 200
    return jsonify({"message": "User not found"}), 404

@app.route('/search_messages', methods=['POST'])
def search_messages():
    data = request.get_json()
    sender_id = data['sender_id']
    receiver_id = data['receiver_id']
    keyword = data['keyword']
    messages = Message.query.filter(
        ((Message.sender_id == sender_id) & (Message.receiver_id == receiver_id) & (Message.sender_deleted == False)) |
        ((Message.sender_id == receiver_id) & (Message.receiver_id == sender_id) & (Message.receiver_deleted == False)),
        Message.content.like(f'%{keyword}%')
    ).order_by(Message.timestamp).all()
    return jsonify([{
        "id": msg.id,
        "sender_id": msg.sender_id,
        "receiver_id": msg.receiver_id,
        "content": msg.content,
        "file_data": base64.b64encode(msg.file_data).decode('utf-8') if msg.file_data else None,
        "file_name": msg.file_name,
        "file_type": msg.file_type,
        "timestamp": msg.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        "edited": msg.edited
    } for msg in messages])


@socketio.on('typing')
def handle_typing_event(data):
    room = get_room_name(data['sender_id'], data['receiver_id'])
    emit('typing', {'sender_id': data['sender_id'], 'typing': data['typing']}, room=room)

# Modify handle_send_message_event to support edited field
@socketio.on('send_message')
def handle_send_message_event(data):
    print("test2")
    app.logger.info(f"{data['sender_id']} has sent message to {data['receiver_id']}")
    if 'file_data' in data and data['file_data']:
        file_data = base64.b64decode(data['file_data'])
        new_message = Message(
            sender_id=data['sender_id'],
            receiver_id=data['receiver_id'],
            file_data=file_data,
            file_name=data['file_name'],
            file_type=data['file_type']
        )
    else:
        new_message = Message(
            sender_id=data['sender_id'],
            receiver_id=data['receiver_id'],
            content=data.get('content', ''),
            edited=data.get('edited', False)
        )
    db.session.add(new_message)
    db.session.commit()
    room = get_room_name(data['sender_id'], data['receiver_id'])
    emit('receive_message', {
        'id': new_message.id,
        'sender_id': new_message.sender_id,
        'receiver_id': new_message.receiver_id,
        'content': new_message.content,
        'file_data': data.get('file_data'),
        'file_name': new_message.file_name,
        'file_type': new_message.file_type,
        'timestamp': new_message.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
        'edited': new_message.edited
    }, room=room, broadcast=True)


@socketio.on('update_status')
def handle_update_status(data):
    user_id = data['user_id']
    status = data['status']
    user = User.query.get(user_id)
    if user:
        user.status = status
        user.last_seen = datetime.datetime.utcnow()
        db.session.commit()
        emit('user_status_updated', {'user_id': user_id, 'status': status}, broadcast=True)


@socketio.on('join')
def on_join(data):
    email = data['email']
    room = data['room']
    join_room(room)
    emit('user_joined', {'email': email, 'room': room}, room=room)

@socketio.on('leave')
def on_leave(data):
    email = data['email']
    room = data['room']
    leave_room(room)
    emit('user_left', {'email': email, 'room': room}, room=room)

def get_room_name(user1, user2):
    return f'room_{min(user1, user2)}_{max(user1, user2)}'


"""
********************* socket end ************************
"""


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


"""
********************* config and model mysqlalchemy end ************************
"""


"""
********************* Auth start ************************
"""


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'])
    specialty = None
    if data['is_doctor'] and data.get('specialty'):
        specialty = Specialty.query.filter_by(name=data['specialty']).first()
        if not specialty:
            specialty = Specialty(name=data['specialty'])
            db.session.add(specialty)
            db.session.flush()  # Ensure the specialty gets an id before committing

    new_user = User(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        password=hashed_password,
        is_doctor=data['is_doctor'],
        specialty_id=specialty.id if specialty else None
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        role = 'admin' if user.is_admin else 'doctor' if user.is_doctor else 'patient'
        access_token = create_access_token(identity={'id': user.id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'is_doctor': user.is_doctor, 'is_admin': user.is_admin, 'specialty': user.specialty.name if user.specialty else None, 'role': role})
        return jsonify(access_token=access_token, role=role, user_id=user.id), 200
    return jsonify({"message": "Invalid credentials"}), 401


"""
********************* Auth end ************************
"""



"""
********************* Users Rout start ************************
"""

@app.route('/specialties', methods=['GET'])
@jwt_required()
def get_specialties():
    specialties = Specialty.query.all()
    return jsonify([{"id": specialty.id, "name": specialty.name} for specialty in specialties]), 200




@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/upload_user/<int:user_id>', methods=['PUT'])
@jwt_required()
def upload_user(user_id):
    current_user = get_jwt_identity()

    if not current_user['is_admin'] and current_user['id'] != user_id:
        return jsonify({"message": "Unauthorized"}), 403

    user = User.query.get_or_404(user_id)

    first_name = request.form.get('first_name')
    last_name = request.form.get('last_name')
    bio = request.form.get('bio')
    profile_pic = request.files.get('profile_pic')

    if first_name:
        user.first_name = first_name
    if last_name:
        user.last_name = last_name
    if bio:
        user.bio = bio
    if profile_pic:
        filename = secure_filename(profile_pic.filename)
        mimetype = profile_pic.mimetype
        pic = ProfilePic(data=profile_pic.read(), name=filename, mimetype=mimetype)
        db.session.add(pic)
        db.session.flush()  # Ensure the pic gets an id before committing
        user.profile_pic_id = pic.id

    db.session.commit()
    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "specialty": user.specialty.name if user.specialty else None,
        "bio": user.bio,
        "profile_pic_id": user.profile_pic_id
    }), 200


@app.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({"message": "Unauthorized"}), 403
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "is_doctor": user.is_doctor,
        "specialty": user.specialty.name if user.specialty else None,
        "bio": user.bio,
        "profile_pic": user.profile_pic.url if user.profile_pic else None,
        "is_admin": user.is_admin
    } for user in users])

@app.route('/users/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    current_user = get_jwt_identity()
    user = User.query.get(id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Check if the user is an admin
    if not current_user['is_admin']:
        return jsonify({"message": "You are not authorized to perform this action"}), 403

    try:
        # Delete messages associated with the user
        Message.query.filter_by(sender_id=id).delete()
        db.session.commit()

        # Delete the user
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()

    if 'is_doctor' in data:
        if isinstance(data['is_doctor'], str):
            data['is_doctor'] = json.loads(data['is_doctor'].lower())
        elif isinstance(data['is_doctor'], bool):
            pass  # القيمة بالفعل منطقية، لا تحتاج لتحويل
    
    user = User.query.get(user_id)
    
    if 'is_doctor' in data:
        user.is_doctor = data['is_doctor']
    
    if 'specialty' in data:
        specialty = Specialty.query.filter_by(name=data['specialty']).first()
        if not specialty:
            specialty = Specialty(name=data['specialty'])
            db.session.add(specialty)
            db.session.flush()
        user.specialty_id = specialty.id
    
    db.session.commit()
    return jsonify({"message": "User updated successfully"})

@app.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({"message": "Unauthorized"}), 403
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'])
    specialty = None
    if data['is_doctor'] and data.get('specialty'):
        specialty = Specialty.query.filter_by(name=data['specialty']).first()
        if not specialty:
            specialty = Specialty(name=data['specialty'])
            db.session.add(specialty)
            db.session.flush()

    new_user = User(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        password=hashed_password,
        is_doctor=data['is_doctor'],
        specialty_id=specialty.id if specialty else None,
        is_admin=data['is_admin']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully!"}), 201

@app.route('/doctors', methods=['GET'])
@jwt_required()
def get_doctors():
    specialty = request.args.get('specialty')
    if specialty:
        specialty_obj = Specialty.query.filter_by(name=specialty).first()
        if specialty_obj:
            doctors = User.query.filter_by(is_doctor=True, specialty_id=specialty_obj.id).all()
        else:
            doctors = []
    else:
        doctors = User.query.filter_by(is_doctor=True).all()
    
    return jsonify([{
        "id": doc.id,
        "first_name": doc.first_name,
        "last_name": doc.last_name,
        "email": doc.email,
        "specialty": doc.specialty.name if doc.specialty else None,
        "profile_pic": doc.profile_pic.data.decode('latin-1') if doc.profile_pic else None
    } for doc in doctors])

@app.route('/doctors/<int:doctor_id>', methods=['GET'])
@jwt_required()
def get_doctor(doctor_id):
    doctor = User.query.filter_by(id=doctor_id, is_doctor=True).first()
    if not doctor:
        return jsonify({"message": "Doctor not found"}), 404
    return jsonify({
        "id": doctor.id,
        "first_name": doctor.first_name,
        "last_name": doctor.last_name,
        "email": doctor.email,
        "specialty": doctor.specialty.name if doctor.specialty else None,
        "bio": doctor.bio,
        "profile_pic": doctor.profile_pic.url if doctor.profile_pic else None
    })


@app.route('/user/<int:id>', methods=['GET'])
@jwt_required()
def get_profile_user(id):
    user = User.query.filter_by(id=id).first()
    if not user:
        return jsonify({"message": "user not found"}), 404
    
    profile_pic_data = None
    if user.profile_pic:
        profile_pic_data = {
            "id": user.profile_pic.id,
            "name": user.profile_pic.name,
            "mimetype": user.profile_pic.mimetype,
            "data": user.profile_pic.data.decode('latin-1')  # تحويل البيانات الثنائية إلى سلسلة
        }

    return jsonify({
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "specialty": user.specialty.name if user.specialty else None,
        "bio": user.bio,
        "profile_pic": profile_pic_data
    })

"""
********************* Users Rout end ************************
"""



# """
# ********************* Model AI Rout start ************************
# """

UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def focal_tversky(y_true, y_pred):
    pass

def tversky(y_true, y_pred):
    pass

def tversky_loss(y_true, y_pred):
    pass

model = keras.models.load_model('seg_model.h5', custom_objects={"focal_tversky": focal_tversky, "tversky": tversky, "tversky_loss": tversky_loss})

def load_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not open or find the image: {image_path}")
    img = cv2.resize(img, (256, 256))
    img = img.astype(np.float32)
    img -= img.mean()
    img /= img.std()
    img = np.expand_dims(img, axis=0)
    return img

def predict_mask(image_path):
    img = load_image(image_path)
    pred_mask = model.predict(img)[0]
    pred_mask = (pred_mask > 0.5).astype(np.uint8)
    pred_mask = pred_mask * 255
    return pred_mask

def classify_tumor(tumor):
   
    if tumor.ndim == 3:
        tumor = tumor[:, :, 0]

    # حساب عدد البكسلات البيضاء
    white_pixel_count = np.sum(tumor)
    
    # تسمية الصورة وحساب عدد المزايا
    labeledImage, num_features = label(tumor, return_num=True)
    
    # قياس الخصائص الإقليمية
    region_measure = regionprops(labeledImage)
    
    # استخراج الخصائص الأساسية
    detected_tumor_area = region_measure[0].area
    detected_tumor_centroid = region_measure[0].centroid
    detected_tumor_perimeter = region_measure[0].perimeter
    
    # حساب عدد البكسلات الكلي
    total_pixels_1 = np.sum(tumor)
    total_pixels_2 = cv2.countNonZero(tumor)
    
    # تحويل المنطقة والمحيط إلى مليمترات
    detected_tumor_area_mm = np.sqrt(total_pixels_2) * 0.26458333
    detected_tumor_perimeter_mm = detected_tumor_perimeter * 0.26458333
    
    # العثور على الحواف
    contours, _ = cv2.findContours(tumor.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    xy = contours[0].squeeze()
    x = xy[:, 0]
    y = xy[:, 1]
    
    # طباعة القيم
    print(f"detected_tumor_area: {detected_tumor_area_mm}")
    print(f"detected_tumor_perimeter: {detected_tumor_perimeter_mm}")
    print(f"detected_tumor_centroid: {detected_tumor_centroid}")

    # تصنيف الورم
    if total_pixels_2 <= 900:
        classification = "NoTumor"
    elif 100 < total_pixels_2 <= 2000:
        classification = "Low"
    elif 2000 < total_pixels_2 <= 4500:
        classification = "Medium"
    else:
        classification = "High"

    
    
    
    # طباعة التصنيف
    print(f"Classification: {classification}")

    # إنشاء رسالة
    message = (
        f"Number of pixels = {total_pixels_1}\n"
        f"detected_tumor_area in pixels = {total_pixels_2:.2f}\n"
        f"detected_tumor_perimeter = {detected_tumor_perimeter:.2f}\n"
        f"detected_tumor_centroid at (x,y) = ({detected_tumor_centroid[1]:.1f}, {detected_tumor_centroid[0]:.1f})\n"
    )
    return classification, message ,tumor

@app.route('/upload', methods=['POST'])
def upload_image():
    print("test")
    if 'image' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected for uploading'}), 400
    try:
        unique_filename = str(uuid.uuid4()) + "_" + file.filename
        original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(original_image_path)
        pred_mask = predict_mask(original_image_path)
        mask_image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'mask_' + unique_filename)
        cv2.imwrite(mask_image_path, pred_mask)
        with open(mask_image_path, 'rb') as f:
            mask_img_bytes = f.read()
        return send_file(BytesIO(mask_img_bytes), mimetype='image/png')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/classify', methods=['POST'])
def classify_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected for uploading'}), 400

        unique_filename = str(uuid.uuid4()) + "_" + file.filename
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(temp_path)

        tumor_img = cv2.imread(temp_path, cv2.IMREAD_GRAYSCALE)
        classification, message ,tumor= classify_tumor(tumor_img)
        
        image_pil = Image.fromarray(tumor_img)
        img_io = BytesIO()
        image_pil.save(img_io, 'TIFF')
        img_io.seek(0)
        
        return jsonify({'message': message, 'classification': classification, 'image': img_io.read().hex()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


"""
********************* Model AI Rout start ************************
"""


if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)
    with app.app_context():
        db.create_all()
    socketio.run(app, debug=True)

