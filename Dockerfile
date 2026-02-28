FROM python:3.10.18

# Set working directory
WORKDIR /app

# Copy app files
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app

# Expose port
EXPOSE 10000

# Run with gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app.main:app"]
