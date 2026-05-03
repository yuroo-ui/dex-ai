FROM python:3.12-slim

WORKDIR /app

# Install web deps
COPY web/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files (skills need to be accessible)
COPY . .

RUN chmod +x start.sh

EXPOSE 8000

CMD ["bash", "start.sh"]
