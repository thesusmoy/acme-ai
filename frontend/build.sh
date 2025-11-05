
IMAGE_NAME="acme-ai-frontend"
TAG="latest"

echo "Building Docker image: $IMAGE_NAME:$TAG"
docker build -t $IMAGE_NAME:$TAG .

echo "Docker image built successfully: $IMAGE_NAME:$TAG"
