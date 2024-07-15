from .auth_routes import auth
from .notifications_routes import notifications
from .appointments_routes import appointments
from .chat_socket_routes import chat_socket
from .users_routes import users_and_doctors
from Models_Ai.models_routes import ai


def routes(app):
    auth(app)
    notifications(app)
    appointments(app)
    chat_socket(app)
    users_and_doctors(app)
    ai(app)
