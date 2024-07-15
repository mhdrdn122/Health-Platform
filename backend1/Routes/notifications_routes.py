from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token , jwt_required
from models import db, Notification
from flask_socketio import SocketIO, emit, join_room, leave_room

 

def notifications(app):
    socketio = SocketIO(app, cors_allowed_origins="*")

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
