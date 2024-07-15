class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/chatapp'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'supersecretkey'
    UPLOAD_FOLDER = 'uploads/'
