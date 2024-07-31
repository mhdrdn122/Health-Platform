import keras
import cv2
import numpy as np
from skimage.measure import label, regionprops
from flask import Flask, request, jsonify ,send_file
import uuid
import os
from PIL import Image
from io import BytesIO
import tensorflow as tf

def ai(app):
    
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

        
        message = (
            f"عدد بكسلات الورم = {total_pixels_1}\n"
            f",مساحة الورم= {detected_tumor_area_mm:.2f}\n"
            f",نصف القطر = {detected_tumor_perimeter_mm:.2f}\n"
            f",احداثيات الورم (x,y) = ({detected_tumor_centroid[1]:.1f}, {detected_tumor_centroid[0]:.1f})\n"
        )
        return classification, message ,tumor

    @app.route('/upload', methods=['POST'])
    def upload_image():
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
            print(message)
            
            # return jsonify({'message': message, 'classification': classification, 'image': img_io.read().hex()}), 200
            return jsonify({'message': message }), 200
        

        except Exception as e:
            return jsonify({'error': str(e)}), 500
        

    # ******************* Model skin cancer start **********************

    # # تحميل النموذج المدرب
    model_path_skin = 'Skin Cancer.h5'
    model_skin = tf.keras.models.load_model(model_path_skin, compile=False)
    model_skin.compile(optimizer='Adamax', loss='categorical_crossentropy', metrics=['accuracy'])

    # أسماء الفئات
    class_labels = ['حميد', 'خبيث']
    # class_labels = ['Benign', 'Malignant']


    def predict_image(img):
        img = img.resize((224, 224))
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        predictions = model_skin.predict(img_array)
        score = tf.nn.softmax(predictions[0])
        predicted_class = class_labels[np.argmax(score)]
        return predicted_class

    @app.route('/predict', methods=['POST'])
    def predict():
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        file = request.files['image']
        img = Image.open(file.stream)
        predicted_class = predict_image(img)
        return jsonify({'prediction': predicted_class})


