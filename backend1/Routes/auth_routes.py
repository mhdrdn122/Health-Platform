
from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token , jwt_required , create_refresh_token , get_jwt_identity
from models import db, User, Specialty

def auth(app):
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
            access_token = create_access_token(identity={'id': user.id, "img": user.profile_pic_id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'is_doctor': user.is_doctor, 'is_admin': user.is_admin, 'specialty': user.specialty.name if user.specialty else None, 'role': role})
            refresh_token = create_refresh_token(identity={'id': user.id, 'role': role})
            return jsonify(access_token=access_token, refresh_token=refresh_token, role=role, is_verified=user.is_verified, user_id=user.id), 200
        return jsonify({"message": "Invalid credentials"}), 401

    @app.route('/refresh', methods=['POST'])
    @jwt_required(refresh=True)
    def refresh():
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        return jsonify(access_token=access_token), 200

