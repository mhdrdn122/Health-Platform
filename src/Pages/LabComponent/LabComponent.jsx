import React, { useState } from 'react';
import axios from 'axios';
import * as UTIF from 'utif';
import './LabComponent.css'; 

const LabComponent = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageURL, setOriginalImageURL] = useState(null);
  const [predictedImage, setPredictedImage] = useState(null);
  const [classifiedImage, setClassifiedImage] = useState(null);
  const [classificationMessage, setClassificationMessage] = useState("");
  const [classification, setClassification] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImage(file);
      setPredictedImage(null);
      setClassifiedImage(null);
      setClassificationMessage("");
      setClassification("");

      if (file.type === 'image/tiff' || file.type === 'image/tif') {
        const arrayBuffer = await file.arrayBuffer();
        const ifds = UTIF.decode(arrayBuffer);
        const tiffImage = ifds[0];
        UTIF.decodeImage(arrayBuffer, tiffImage);
        const rgba = UTIF.toRGBA8(tiffImage);

        const canvas = document.createElement('canvas');
        canvas.width = tiffImage.width;
        canvas.height = tiffImage.height;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(tiffImage.width, tiffImage.height);
        imageData.data.set(rgba);
        ctx.putImageData(imageData, 0, 0);

        setOriginalImageURL(canvas.toDataURL());
      } else {
        setOriginalImageURL(URL.createObjectURL(file));
      }
    }
  };

  const handleUpload = async () => {
    if (!originalImage) {
      alert("Please upload an image first!");
      return;
    }

    setIsLoading(true); // Show loading indicator
    try {
      const formData = new FormData();
      formData.append('image', originalImage);

      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'arraybuffer'
      });

      const arrayBuffer = response.data;
      const ifds = UTIF.decode(arrayBuffer);
      const tiffImage = ifds[0];
      UTIF.decodeImage(arrayBuffer, tiffImage);
      const rgba = UTIF.toRGBA8(tiffImage);

      const canvas = document.createElement('canvas');
      canvas.width = tiffImage.width;
      canvas.height = tiffImage.height;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(tiffImage.width, tiffImage.height);
      imageData.data.set(rgba);
      ctx.putImageData(imageData, 0, 0);

      setPredictedImage(canvas.toDataURL());
    } catch (error) {
      console.error(error);
      alert("Failed to upload image. Please try again.");
    }
    setIsLoading(false); // Hide loading indicator
  };

  const handleClassify = async () => {
    if (!predictedImage) {
      alert("Please upload and process an image first!");
      return;
    }

    setIsLoading(true); // Show loading indicator
    try {
      const formData = new FormData();
      const blob = await fetch(predictedImage).then(res => res.blob());
      formData.append('image', blob);

      const response = await axios.post('http://localhost:5000/classify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // const { message, classification, image } = response.data;
      console.log(response)
      const { message } = response.data;
      console.log(message.split(","))

      // const arrayBuffer = new Uint8Array(image.match(/.{1,2}/g).map(byte => parseInt(byte, 16))).buffer;
      // const ifds = UTIF.decode(arrayBuffer);
      // const tiffImage = ifds[0];
      // UTIF.decodeImage(arrayBuffer, tiffImage);
      // const rgba = UTIF.toRGBA8(tiffImage);

      // const canvas = document.createElement('canvas');
      // canvas.width = tiffImage.width;
      // canvas.height = tiffImage.height;
      // const ctx = canvas.getContext('2d');
      // const imageData = ctx.createImageData(tiffImage.width, tiffImage.height);
      // imageData.data.set(rgba);
      // ctx.putImageData(imageData, 0, 0);

      // setClassifiedImage(canvas.toDataURL());
      setClassificationMessage(message);
      // setClassification(classification);
    } catch (error) {
      console.error(error);
      alert("Failed to classify image. Please try again.");
    }
    setIsLoading(false); // Hide loading indicator
  };

  return (
    <div class="container">
  <h1>المختبر</h1>
  <div class="buttons">
    <label for="file-input">أختر صورة</label>
    <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} />
    <button onClick={handleUpload}>تجزئة</button>
    <button onClick={handleClassify}>معلومات الورم</button>
  </div>

  {isLoading && <div class="loading">جاري التحميل...</div>}

  <div class="images">
    <div class="image-container">
      <h2>الصورة الاصلية</h2>
      {originalImageURL ? <img src={originalImageURL} alt="Original" /> : <div class="placeholder" />}
    </div>

    <div class="image-container">
      <h2>الورم</h2>
      {predictedImage ? <img src={predictedImage} alt="Predicted" /> : <div class="placeholder" />}
    </div>

    {/* <div class="image-container">
      <h2>Classified Image</h2>
      {classifiedImage ? <img src={classifiedImage} alt="Classified" /> : <div class="placeholder" />}
    </div> */}

<div class="info image-container">
      <h2>معلومات الورم</h2>
      <pre>{classificationMessage}</pre>
      {/* <p><strong>Classification:</strong> {classification}</p> */}
    </div>
  </div>

  {classificationMessage && (
    // <div class="info">
    //   <h2>Classification Result</h2>
    //   <pre>{classificationMessage}</pre>
    //   {/* <p><strong>Classification:</strong> {classification}</p> */}
    // </div>
    <></>
  )}
  
</div>

  );
};

export default LabComponent;
