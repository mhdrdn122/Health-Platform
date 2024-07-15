from extensions import db
from datetime import datetime

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
    doctor_verification = db.relationship('DoctorVerification', backref='user', uselist=False)
    verified_doctor = db.relationship('VerifiedDoctor', backref='user', uselist=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_verified = db.Column(db.Boolean, default=False)  
    last_seen = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
    
    def __repr__(self):
        return f'<User {self.first_name} {self.last_name}>'
    
class DoctorVerification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    address = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    clinic_address = db.Column(db.String(255), nullable=False)
    degree = db.Column(db.String(255), nullable=False)
    degree_certificate = db.Column(db.LargeBinary, nullable=False)
    license_number = db.Column(db.String(255), nullable=False)
    license_certificate = db.Column(db.LargeBinary, nullable=False)
    issuing_authority = db.Column(db.String(255), nullable=False)
    experience_years = db.Column(db.Integer, nullable=False)
    previous_workplaces = db.Column(db.Text, nullable=False)
    professional_membership = db.Column(db.String(255), nullable=False)
    membership_number = db.Column(db.String(255), nullable=False)
    profile_picture = db.Column(db.LargeBinary, nullable=False)
    identity_document = db.Column(db.LargeBinary, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    verified_doctor = db.relationship('VerifiedDoctor', backref='verification', uselist=False)

    def __repr__(self):
        return f'<DoctorVerification {self.full_name}>'

class VerifiedDoctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    verification_id = db.Column(db.Integer, db.ForeignKey('doctor_verification.id'), nullable=False)
    verified_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<VerifiedDoctor {self.user_id}>'



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
    read = db.Column(db.Boolean, default=False)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    patient_name = db.Column(db.String(150), nullable=False)
    patient_phone = db.Column(db.String(20), nullable=False)
    patient_gender = db.Column(db.String(10), nullable=False)
    datetime = db.Column(db.DateTime, nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_approved = db.Column(db.Boolean, nullable=False, default=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    doctor = db.relationship('User', foreign_keys=[doctor_id], backref=db.backref('doctor_appointments', lazy=True))
    patient = db.relationship('User', foreign_keys=[patient_id], backref=db.backref('patient_appointments', lazy=True))

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    user = db.relationship('User', backref=db.backref('notifications', lazy=True))

    def __repr__(self):
        return f'<Notification {self.message}>'
 