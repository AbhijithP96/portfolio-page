import cv2

image = cv2.imread('./pic_web.jpg')

image = cv2.resize(image, (960,480))

cv2.imwrite('./main_pic.jpg', image)