import React, { useState } from 'react';
import axios from 'axios';
import './LabSkin.css';  // تأكد من استيراد ملف CSS الجديد

function LabSkin() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setPrediction('');
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error during prediction:', error);
    }
    setLoading(false);
  };

  return (
    <div className="skin">
      <h1>مختبر اورام الجلد</h1>
      <div className="buttons-container">
        <input type="file" id="upload" onChange={handleImageChange} style={{ display: 'none' }} />
        <label htmlFor="upload" className="custom-button">تحميل من الجهاز</label>
        <button onClick={handlePredict} className="custom-button">تصنيف</button>
      </div>
      <div className="image-preview" style={{ backgroundColor: preview ? 'transparent' : '#f0f0f0' }}>
        {preview && <img src={preview} alt="Selected" />}
      </div>
      {loading && <h2>جاري التحميل...</h2>}
      {prediction && !loading && <h2> الصنف:  {prediction}</h2>}
    </div>
  );
}

export default LabSkin;
