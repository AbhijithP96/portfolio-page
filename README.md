# 🚀 Portfolio Website

This is my personal portfolio website built using **Flask** and deployed on **Render** using a custom **Dockerfile**.

---

## 🛠 Tech Stack

- Python
- Flask
- Gunicorn (Production Server)
- Docker
- Render (Cloud Deployment)

## Running with Docker

```bash
#build image
docker build -t portfolio-app .

#run container
docker run -p 10000:10000 portfolio-app
```

## Deployment on Render

- The app is containerized using a custom Dockerfile.
- The GitHub repository is connected to Render.
- Render builds the Docker image automatically.
- The app runs using Gunicorn inside the container.

## Live Website

[Portfolio](https://portfolio-page-4nqk.onrender.com)

