
from flask import request, jsonify , send_from_directory
from werkzeug.security import generate_password_hash
from flask_jwt_extended import  jwt_required , get_jwt_identity
from models import db, User, Specialty ,ProfilePic ,Message , DoctorVerification , VerifiedDoctor
import json
from werkzeug.utils import secure_filename


def users_and_doctors(app):

  
    @app.route('/verify_doctor', methods=['POST'])
    def verify_doctor():
        data = request.form.to_dict()
        files = request.files
        user_id = data.get('user_id')

        # التحقق من وجود المستخدم في جداول DoctorVerification و VerifiedDoctor
        existing_verification = DoctorVerification.query.filter_by(user_id=user_id).first()
        existing_verified_doctor = VerifiedDoctor.query.filter_by(user_id=user_id).first()

        if existing_verification:
            # تحديث المعلومات القديمة
            existing_verification.full_name = data.get('fullName')
            existing_verification.birth_date = data.get('birthDate')
            existing_verification.address = data.get('address')
            existing_verification.phone_number = data.get('phoneNumber')
            existing_verification.email = data.get('email')
            existing_verification.clinic_address = data.get('clinicAddress')
            existing_verification.degree = data.get('degree')

            if 'degreeCertificate' in files:
                existing_verification.degree_certificate = files['degreeCertificate'].read()
            if 'licenseCertificate' in files:
                existing_verification.license_certificate = files['licenseCertificate'].read()
            
            existing_verification.license_number = data.get('licenseNumber')
            existing_verification.issuing_authority = data.get('issuingAuthority')
            existing_verification.experience_years = data.get('experienceYears')
            existing_verification.previous_workplaces = data.get('previousWorkplaces')
            existing_verification.professional_membership = data.get('professionalMembership')
            existing_verification.membership_number = data.get('membershipNumber')

            if 'profilePicture' in files:
                existing_verification.profile_picture = files['profilePicture'].read()
            if 'identityDocument' in files:
                existing_verification.identity_document = files['identityDocument'].read()

            db.session.commit()
        else:
            # إضافة معلومات جديدة
            new_verification = DoctorVerification(
                user_id=user_id,
                full_name=data.get('fullName'),
                birth_date=data.get('birthDate'),
                address=data.get('address'),
                phone_number=data.get('phoneNumber'),
                email=data.get('email'),
                clinic_address=data.get('clinicAddress'),
                degree=data.get('degree'),
                degree_certificate=files['degreeCertificate'].read(),
                license_number=data.get('licenseNumber'),
                license_certificate=files['licenseCertificate'].read(),
                issuing_authority=data.get('issuingAuthority'),
                experience_years=data.get('experienceYears'),
                previous_workplaces=data.get('previousWorkplaces'),
                professional_membership=data.get('professionalMembership'),
                membership_number=data.get('membershipNumber'),
                profile_picture=files['profilePicture'].read(),
                identity_document=files['identityDocument'].read()
            )
            db.session.add(new_verification)
            db.session.commit()

            # إضافة الطبيب إلى جدول الأطباء الموثقين
            new_verified_doctor = VerifiedDoctor(
                user_id=user_id,
                verification_id=new_verification.id
            )
            db.session.add(new_verified_doctor)
            db.session.commit()

        return jsonify({'message': 'Verification data processed successfully'}), 200


    
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
            # "profile_pic": user.profile_pic.url if user.profile_pic else None,
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
        print(specialty)
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
            "profile_pic": doc.profile_pic.data.decode('latin-1') if doc.profile_pic else None,
            "is_verified": doc.is_verified
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
            "profile_pic": profile_pic_data,
            "verified":user.is_verified
        })

    @app.route('/doctor/<int:doctor_id>', methods=['GET'])
    @jwt_required()
    def get_doctor_details(doctor_id):
        print(doctor_id)
        doctor_verification = DoctorVerification.query.filter_by(user_id=doctor_id).first()
        if doctor_verification:
            return jsonify({
                "full_name": doctor_verification.full_name,
                "birth_date": doctor_verification.birth_date,
                "address": doctor_verification.address,
                "phone_number": doctor_verification.phone_number,
                "email": doctor_verification.email,
                "clinic_address": doctor_verification.clinic_address,
                "degree": doctor_verification.degree,
                "degree_certificate": doctor_verification.degree_certificate.decode('latin-1'),
                "license_number": doctor_verification.license_number,
                "license_certificate": doctor_verification.license_certificate.decode('latin-1'),
                "issuing_authority": doctor_verification.issuing_authority,
                "experience_years": doctor_verification.experience_years,
                "previous_workplaces": doctor_verification.previous_workplaces,
                "professional_membership": doctor_verification.professional_membership,
                "membership_number": doctor_verification.membership_number,
                "profile_picture": doctor_verification.profile_picture.decode('latin-1'),
                "identity_document": doctor_verification.identity_document.decode('latin-1')
            })
        return jsonify({"error": "Doctor not found"}), 404

    @app.route('/doctor/verify/<int:doctor_id>', methods=['POST'])
    @jwt_required()
    def verify_doctors(doctor_id):
        doctor = User.query.get(doctor_id)
        if doctor:
            doctor.is_verified = True
            db.session.commit()
            return jsonify({"message": "Doctor verified successfully"}), 200
        return jsonify({"error": "Doctor not found"}), 404
