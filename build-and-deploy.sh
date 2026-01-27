#!/bin/bash
set -e

VERSION=${1:-v1.0.0}
REGISTRY=${2:-your-registry}

echo "Building Docker image: $REGISTRY/pms-frontend:$VERSION"
docker build -t $REGISTRY/pms-frontend:$VERSION .
docker tag $REGISTRY/pms-frontend:$VERSION $REGISTRY/pms-frontend:latest

echo "Pushing to registry..."
docker push $REGISTRY/pms-frontend:$VERSION
docker push $REGISTRY/pms-frontend:latest

echo "Updating Kubernetes deployment..."
kubectl set image deployment/pms-frontend pms-frontend=$REGISTRY/pms-frontend:$VERSION

echo "Deployment complete!"
