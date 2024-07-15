def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        role = 'admin' if user.is_admin else 'doctor' if user.is_doctor else 'patient'
        access_token = create_access_token(identity={'id': user.id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'is_doctor': user.is_doctor, 'is_admin': user.is_admin, 'specialty': user.specialty.name if user.specialty else None, 'role': role})
        return jsonify(access_token=access_token, role=role, user_id=user.id), 200
    return jsonify({"message": "Invalid credentials"}), 401

