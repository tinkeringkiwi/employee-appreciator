# Multi-stage build: build Next.js frontend, then assemble final image with Node + Python runtime

### Builder: build the Next.js app
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies and build frontend
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build


### Final image: run Next.js (Node) and Python backend in the same container
FROM node:20-slim

# Install Python runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-venv python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built frontend and application files from builder
COPY --from=builder /app /app

# Create a lightweight virtualenv for Python dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies for the backend
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Make start script available
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expose ports used by Next.js and Flask
EXPOSE 3000 8081

CMD ["/usr/local/bin/start.sh"]
