from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token , jwt_required
from models import db, Message ,User
from flask_socketio import SocketIO, emit, join_room, leave_room
import base64
from datetime import datetime
from sqlalchemy import desc

def chat_socket(app):

    
    socketio = SocketIO(app, cors_allowed_origins="*")

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
    
    @app.route('/read_message', methods=['POST'])
    def read_message():
        data = request.get_json()
        message_id = data['message_id']
        message = Message.query.get(message_id)
        if message:
            message.read = True
            db.session.commit()
            return jsonify({"message": "Message marked as read"}), 200
        return jsonify({"message": "Message not found"}), 404


    @app.route('/update_last_seen', methods=['POST'])
    def update_last_seen():
        data = request.get_json()
        user_id = data['user_id']
        user = User.query.get(user_id)
        if user:
            user.last_seen = datetime.utcnow()
            db.session.commit()
            return jsonify({"message": "Last seen updated"}), 200
        return jsonify({"message": "User not found"}), 404

    @app.route('/user_status/<int:user_id>', methods=['GET'])
    def get_user_status(user_id):
        print("test")
        user = User.query.get(user_id)
        if user:
            now = datetime.utcnow()
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

    # list chat
    @app.route('/api/chatlist/<int:user_id>', methods=['GET'])
    def get_chatlist(user_id):
        sent_messages = Message.query.filter_by(sender_id=user_id).all()
        received_messages = Message.query.filter_by(receiver_id=user_id).all()

        user_ids = set()
        for message in sent_messages:
            user_ids.add(message.receiver_id)
        for message in received_messages:
            user_ids.add(message.sender_id)

        users = User.query.filter(User.id.in_(user_ids)).all()

        chat_list = []
        for user in users:
            last_message = Message.query.filter(
                ((Message.sender_id == user_id) & (Message.receiver_id == user.id)) |
                ((Message.sender_id == user.id) & (Message.receiver_id == user_id))
            ).order_by(desc(Message.timestamp)).first()

            chat_list.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'last_message_content': last_message.content[:50] if last_message else "",
                'last_message_timestamp': last_message.timestamp if last_message else None
            })

        chat_list.sort(key=lambda x: x['last_message_timestamp'], reverse=True)

        return jsonify(chat_list)

    @socketio.on('typing')
    def handle_typing_event(data):
        room = get_room_name(data['sender_id'], data['receiver_id'])
        emit('typing', {'sender_id': data['sender_id'], 'typing': data['typing']}, room=room)

    # Modify handle_send_message_event to support edited field
    @socketio.on('send_message')
    def handle_send_message_event(data):
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
            'edited': new_message.edited,
            'read': new_message.read
        }, room=room, broadcast=True)


    # @socketio.on('update_status')
    # def handle_update_status(data):
    #     user_id = data['user_id']
    #     status = data['status']
    #     user = User.query.get(user_id)
    #     if user:
    #         user.status = status
    #         user.last_seen = datetime.utcnow()
    #         db.session.commit()
    #         emit('user_status_updated', {'user_id': user_id, 'status': status}, broadcast=True)


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

