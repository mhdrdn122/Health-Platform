from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token , jwt_required
from models import db, Appointment



def appointments(app):
    @app.route('/appointments', methods=['POST'])
    @jwt_required()
    def create_appointment():
        data = request.get_json()
        patient_id = data.get('patient_id')
        patient_name = data.get('patient_name')
        patient_phone = data.get('patient_phone')
        patient_gender = data.get('patient_gender')
        doctor_id = data.get('doctor_id')
        datetime_str = data.get('datetime')
        is_approved = data.get('is_approved')




        if not patient_name or not patient_phone or not patient_gender or not doctor_id or not datetime_str:
            return jsonify({"error": "Missing required parameters"}), 400

        # datetime_obj = datetime.datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')

        # تحقق من عدم وجود موعد في نفس الوقت لنفس الطبيب
        existing_appointment = Appointment.query.filter_by(doctor_id=doctor_id, datetime=datetime_str).first()
        if existing_appointment:
            return jsonify({"error": "Doctor already has an appointment at this time"}), 400

        appointment = Appointment(
            patient_id=patient_id, 
            patient_name=patient_name, 
            patient_phone=patient_phone, 
            patient_gender=patient_gender, 
            doctor_id=doctor_id, 
            datetime=datetime_str,
            is_approved=is_approved, 

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
            "patient_id": appointment.patient_id,
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
            "patient_id": appointment.patient_id,
            "patient_name": appointment.patient_name,
            "patient_phone": appointment.patient_phone,
            "patient_gender": appointment.patient_gender,
            "datetime": appointment.datetime.strftime('%Y-%m-%d %H:%M:%S'),
            "doctor_id": appointment.doctor_id,
            "doctor_name": f"{appointment.doctor.first_name} {appointment.doctor.last_name}",
            "is_approved": appointment.is_approved
        } for appointment in appointments])

