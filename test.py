
import tifffile as tiff

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

file_path = 'M:/models/Vgg brain/1.tif'
data = tiff.imread(file_path)

# نفترض أن البيانات قد تم قراءتها باستخدام tifffile
# data = tiff.imread(file_path)

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# نختار عتبة لعرض البيانات
threshold = 10  # يمكن تعديل هذه القيمة حسب احتياجك

# نحصل على الإحداثيات حيث تكون القيمة أعلى من العتبة
x, y, z = np.where(data > threshold)

ax.scatter(x, y, z, c='blue', marker='o')

ax.set_xlabel('X Label')
ax.set_ylabel('Y Label')
ax.set_zlabel('Z Label')

plt.show()
