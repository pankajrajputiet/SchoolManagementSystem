# School Management System - Deployment Guide

A complete guide to deploying the School Management System on AWS EKS with Docker, Kubernetes, and monitoring.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development with Docker Compose](#2-local-development-with-docker-compose)
3. [Building and Pushing Docker Images](#3-building-and-pushing-docker-images)
4. [AWS EKS Cluster Setup](#4-aws-eks-cluster-setup)
5. [Kubernetes Infrastructure Setup](#5-kubernetes-infrastructure-setup)
6. [Deploying the Application](#6-deploying-the-application)
7. [Monitoring Setup](#7-monitoring-setup)
8. [Verification and Testing](#8-verification-and-tests)
9. [Troubleshooting](#9-troubleshooting)
10. [Security Best Practices](#10-security-best-practices)

---

## 1. Prerequisites

Install the following tools on your local machine:

### Required Tools

```bash
# AWS CLI - For AWS operations
# Install on macOS:
brew install awscli

# Install on Linux:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install on Windows: Download from https://aws.amazon.com/cli/

# eksctl - For EKS cluster management
# Install on macOS:
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl

# Install on Linux:
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# kubectl - For Kubernetes operations
# Install on macOS:
brew install kubectl

# Install on Linux:
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Helm - For Kubernetes package management
# Install on macOS:
brew install helm

# Install on Linux:
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Docker - For building and running containers
# Install from: https://docs.docker.com/get-docker/
```

### Verify Installations

```bash
aws --version          # Should show aws-cli/2.x.x
eksctl version         # Should show 0.x.x
kubectl version        # Should show Client Version: v1.x.x
helm version           # Should show v3.x.x
docker --version       # Should show Docker version 24.x.x
```

### AWS Configuration

```bash
# Configure AWS credentials
aws configure

# You'll need:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)

# Verify configuration
aws sts get-caller-identity
```

---

## 2. Local Development with Docker Compose

### Step 1: Navigate to Deploy Directory

```bash
cd deploy
```

### Step 2: Start Services

```bash
# Build and start all services
docker compose up --build

# Or run in background
docker compose up --build -d
```

This will start:
- **MongoDB** on port 27017
- **Backend API** on port 5000
- **Frontend** on port 80

### Step 3: Verify Services

```bash
# Check running containers
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Step 4: Access the Application

- **Frontend**: http://localhost
- **Backend Health**: http://localhost/api/health
- **Metrics Endpoint**: http://localhost/api/metrics
- **MongoDB**: mongodb://localhost:27017

### Step 5: Test the API

```bash
# Health check
curl http://localhost/api/health

# Metrics endpoint
curl http://localhost/api/metrics

# Login (default admin credentials)
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
```

### Step 6: Stop Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

---

## 3. Building and Pushing Docker Images

### Step 1: Login to Docker Hub

```bash
docker login

# Enter your Docker Hub username and password
```

### Step 2: Build Backend Image

```bash
# From project root directory
docker build \
  -f deploy/docker/backend/Dockerfile \
  -t your-dockerhub-username/school-mgmt-backend:v1.0.0 \
  -t your-dockerhub-username/school-mgmt-backend:latest \
  ./server
```

### Step 3: Build Frontend Image

```bash
# From project root directory
docker build \
  -f deploy/docker/frontend/Dockerfile \
  --build-arg VITE_API_BASE_URL=/api/v1 \
  -t your-dockerhub-username/school-mgmt-frontend:v1.0.0 \
  -t your-dockerhub-username/school-mgmt-frontend:latest \
  ./client
```

### Step 4: Push Images to Docker Hub

```bash
# Push backend images
docker push your-dockerhub-username/school-mgmt-backend:v1.0.0
docker push your-dockerhub-username/school-mgmt-backend:latest

# Push frontend images
docker push your-dockerhub-username/school-mgmt-frontend:v1.0.0
docker push your-dockerhub-username/school-mgmt-frontend:latest
```

### Step 5: Verify Images on Docker Hub

Visit https://hub.docker.com/ and check your repositories.

---

## 4. AWS EKS Cluster Setup

### Step 1: Create EKS Cluster

```bash
# Create cluster with managed node group
eksctl create cluster \
  --name school-mgmt \
  --region us-east-1 \
  --nodegroup-name sms-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed \
  --version 1.28 \
  --alb-ingress-access

# This will take 10-15 minutes
# It creates:
# - VPC with public and private subnets
# - EKS control plane
# - Managed node group with 2 t3.medium instances
# - IAM roles and policies
```

### Step 2: Verify Cluster Access

```bash
# kubectl config is automatically updated
# Verify access
kubectl get nodes

# You should see 2 nodes in Ready status
```

### Step 3: Install AWS Load Balancer Controller

```bash
# Create IAM OIDC provider (if not already created)
eksctl utils associate-iam-oidc-provider \
  --region us-east-1 \
  --name school-mgmt \
  --approve

# Add EKS Helm repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=school-mgmt \
  --set serviceAccount.create=true \
  --set region=us-east-1

# Verify installation
kubectl get deployment aws-load-balancer-controller -n kube-system
```

### Step 4: Install Metrics Server (for HPA)

```bash
# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Verify
kubectl get deployment metrics-server -n kube-system
```

---

## 5. Kubernetes Infrastructure Setup

### Step 1: Update Configuration Files

Before deploying, update the following files with your actual values:

#### Update Secrets

```bash
# Generate a strong JWT secret
openssl rand -hex 64

# Encode values in base64
echo -n 'your-jwt-secret-here' | base64
echo -n 'mongodb+srv://user:pass@cluster.mongodb.net/db' | base64
echo -n 'your-cloudinary-cloud-name' | base64
echo -n 'your-cloudinary-api-key' | base64
echo -n 'your-cloudinary-api-secret' | base64

# Edit the secrets file
nano deploy/kubernetes/secrets.yaml

# Replace the placeholder base64 values with your actual encoded values
```

#### Update Deployment Images

```bash
# Edit backend deployment
nano deploy/kubernetes/backend/deployment.yaml
# Replace: your-dockerhub-username/school-mgmt-backend:latest
# With: your-actual-username/school-mgmt-backend:v1.0.0

# Edit frontend deployment
nano deploy/kubernetes/frontend/deployment.yaml
# Replace: your-dockerhub-username/school-mgmt-frontend:latest
# With: your-actual-username/school-mgmt-frontend:v1.0.0
```

#### Update CORS Origin (After ALB is created)

```bash
# After deploying the ingress (Step 6), get the ALB URL
kubectl get ingress sms-ingress -n school-management

# Edit the configmap with the ALB URL
nano deploy/kubernetes/configmap.yaml
# Update CORS_ORIGIN to: https://your-alb-url.us-east-1.elb.amazonaws.com

# Apply the updated configmap
kubectl apply -f deploy/kubernetes/configmap.yaml

# Restart backend pods to pick up the change
kubectl rollout restart deployment sms-backend -n school-management
```

### Step 2: Create Namespaces

```bash
kubectl apply -f deploy/kubernetes/namespace.yaml

# Verify
kubectl get namespaces
```

### Step 3: Create Secrets and ConfigMap

```bash
# Apply secrets (with your actual values)
kubectl apply -f deploy/kubernetes/secrets.yaml

# Apply configmap
kubectl apply -f deploy/kubernetes/configmap.yaml

# Verify
kubectl get secrets -n school-management
kubectl get configmap sms-config -n school-management -o yaml
```

---

## 6. Deploying the Application

### Step 1: Deploy Backend

```bash
# Apply backend deployment
kubectl apply -f deploy/kubernetes/backend/deployment.yaml

# Apply backend service
kubectl apply -f deploy/kubernetes/backend/service.yaml

# Verify
kubectl get pods -n school-management -l app=sms-backend
kubectl get svc sms-backend -n school-management

# Check logs
kubectl logs -f deployment/sms-backend -n school-management
```

### Step 2: Deploy Frontend

```bash
# Apply frontend deployment
kubectl apply -f deploy/kubernetes/frontend/deployment.yaml

# Apply frontend service
kubectl apply -f deploy/kubernetes/frontend/service.yaml

# Verify
kubectl get pods -n school-management -l app=sms-frontend
kubectl get svc sms-frontend -n school-management
```

### Step 3: Deploy Ingress (Creates ALB)

```bash
# Apply ingress
kubectl apply -f deploy/kubernetes/ingress.yaml

# Wait for ALB to be created (2-5 minutes)
kubectl get ingress sms-ingress -n school-management -w

# You should see an ADDRESS column populated with the ALB hostname
# Example: k8s-default-smsingre-xxxxxx.us-east-1.elb.amazonaws.com
```

### Step 4: Update CORS Origin

After the ALB is created:

```bash
# Get ALB URL
ALB_URL=$(kubectl get ingress sms-ingress -n school-management -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "ALB URL: $ALB_URL"

# Update configmap with ALB URL
kubectl patch configmap sms-config -n school-management \
  --type merge \
  -p "{\"data\":{\"CORS_ORIGIN\":\"http://$ALB_URL,http://localhost:3000\"}}"

# Restart backend to pick up new config
kubectl rollout restart deployment sms-backend -n school-management
```

### Step 5: Deploy HPAs

```bash
# Apply backend HPA
kubectl apply -f deploy/kubernetes/backend/hpa.yaml

# Apply frontend HPA
kubectl apply -f deploy/kubernetes/frontend/hpa.yaml

# Verify
kubectl get hpa -n school-management
```

### Step 6: Deploy Network Policies (Optional)

```bash
# Apply network policies
kubectl apply -f deploy/kubernetes/network-policies.yaml

# Verify
kubectl get networkpolicy -n school-management
```

### Step 7: Verify Deployment

```bash
# Check all pods
kubectl get pods -n school-management

# Check all services
kubectl get svc -n school-management

# Check ingress
kubectl get ingress -n school-management

# Check HPAs
kubectl get hpa -n school-management

# Access the application via ALB URL
ALB_URL=$(kubectl get ingress sms-ingress -n school-management -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$ALB_URL/api/health
```

---

## 7. Monitoring Setup

### Step 1: Deploy Prometheus

```bash
# Apply Prometheus configmap
kubectl apply -f deploy/monitoring/prometheus/configmap.yaml

# Apply Prometheus deployment
kubectl apply -f deploy/monitoring/prometheus/deployment.yaml

# Apply Prometheus service and RBAC
kubectl apply -f deploy/monitoring/prometheus/service.yaml

# Verify
kubectl get pods -n monitoring -l app=prometheus
kubectl get svc prometheus -n monitoring
```

### Step 2: Deploy Grafana

```bash
# Apply Grafana dashboard configmap
kubectl apply -f deploy/monitoring/grafana/dashboard-configmap.yaml

# Apply Grafana datasource configmap
kubectl apply -f deploy/monitoring/grafana/datasource-configmap.yaml

# Apply Grafana deployment
kubectl apply -f deploy/monitoring/grafana/deployment.yaml

# Apply Grafana service
kubectl apply -f deploy/monitoring/grafana/service.yaml

# Verify
kubectl get pods -n monitoring -l app=grafana
kubectl get svc grafana -n monitoring
```

### Step 3: Access Monitoring Tools

```bash
# Access Prometheus (port-forward)
kubectl port-forward svc/prometheus 9090:9090 -n monitoring

# Open browser: http://localhost:9090
# Check targets: http://localhost:9090/targets

# Access Grafana (port-forward)
kubectl port-forward svc/grafana 3000:3000 -n monitoring

# Open browser: http://localhost:3000
# Login: admin / admin123
# Navigate to: Dashboards -> School Management System Dashboard
```

### Step 4: Verify Metrics

In Prometheus:
1. Go to http://localhost:9090/targets
2. Verify `sms-backend` shows as "UP"
3. Query: `http_requests_total` to see request metrics

In Grafana:
1. Login and navigate to the auto-loaded dashboard
2. Verify panels show data
3. Check HTTP request rate, duration, memory, CPU, etc.

---

## 8. Verification and Tests

### Local Docker Testing Checklist

```bash
# 1. All services running
docker compose ps

# 2. Frontend accessible
curl http://localhost

# 3. Backend health check
curl http://localhost/api/health
# Expected: {"status":"ok","timestamp":"..."}

# 4. Metrics endpoint
curl http://localhost/api/metrics
# Expected: Prometheus-format metrics

# 5. Login works
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
# Expected: JWT token in response

# 6. Access protected route
TOKEN="<your-jwt-token>"
curl http://localhost/api/v1/students \
  -H "Authorization: Bearer $TOKEN"
# Expected: Student list
```

### Kubernetes Testing Checklist

```bash
# 1. All pods running
kubectl get pods -n school-management
# Expected: All pods in Running state

# 2. Backend pods (should be 2+)
kubectl get pods -n school-management -l app=sms-backend

# 3. Frontend pods (should be 2+)
kubectl get pods -n school-management -l app=sms-frontend

# 4. Services exist
kubectl get svc -n school-management

# 5. Ingress has ALB address
kubectl get ingress -n school-management
# Expected: ADDRESS column populated

# 6. HPAs active
kubectl get hpa -n school-management
# Expected: Shows current/target metrics

# 7. Access via ALB
ALB_URL=$(kubectl get ingress sms-ingress -n school-management -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$ALB_URL/api/health

# 8. Frontend via ALB
curl http://$ALB_URL

# 9. Test login via ALB
curl -X POST http://$ALB_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
```

### Monitoring Checklist

```bash
# 1. Prometheus targets UP
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Visit http://localhost:9090/targets

# 2. Grafana accessible
kubectl port-forward svc/grafana 3000:3000 -n monitoring
# Visit http://localhost:3000

# 3. Dashboard shows data
# Login to Grafana and verify all panels have data

# 4. Metrics are being collected
# In Prometheus, query: http_requests_total
```

---

## 9. Troubleshooting

### Common Issues

#### 1. Pods in Pending State

```bash
# Check pod events
kubectl describe pod <pod-name> -n school-management

# Common causes:
# - Insufficient cluster resources
# - Image pull errors (check Docker Hub credentials)
# - Node not ready

# Check cluster resources
kubectl top nodes
kubectl describe nodes
```

#### 2. Image Pull Errors

```bash
# If using private Docker Hub repo, create image pull secret
kubectl create secret docker-registry dockerhub-credentials \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_PASSWORD \
  -n school-management

# Uncomment imagePullSecrets in deployment.yaml
```

#### 3. Ingress Not Getting ALB Address

```bash
# Check ingress events
kubectl describe ingress sms-ingress -n school-management

# Verify ALB controller is running
kubectl get deployment aws-load-balancer-controller -n kube-system

# Check ALB controller logs
kubectl logs -f deployment/aws-load-balancer-controller -n kube-system

# Common issues:
# - ALB controller not installed
# - IAM permissions missing
# - Subnet tags incorrect (ensure subnets have kubernetes.io/cluster/school-mgmt tags)
```

#### 4. Backend Can't Connect to MongoDB

```bash
# Check backend logs
kubectl logs -f deployment/sms-backend -n school-management

# Verify secret values
kubectl get secret sms-secrets -n school-management -o jsonpath='{.data.mongodb-uri}' | base64 -d

# Test MongoDB connectivity from pod
kubectl exec -it <backend-pod> -n school-management -- sh
# Inside pod: ping your-cluster.mongodb.net
```

#### 5. CORS Errors

```bash
# Check configmap
kubectl get configmap sms-config -n school-management -o yaml

# Verify CORS_ORIGIN includes your ALB URL
# Update if needed:
kubectl patch configmap sms-config -n school-management \
  --type merge \
  -p '{"data":{"CORS_ORIGIN":"http://your-alb-url.elb.amazonaws.com"}}'

# Restart backend
kubectl rollout restart deployment sms-backend -n school-management
```

#### 6. HPA Not Working

```bash
# Check metrics server
kubectl get deployment metrics-server -n kube-system

# Check HPA status
kubectl describe hpa sms-backend-hpa -n school-management

# Common issue: metrics-server not installed
# Install it: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### 7. Prometheus Not Scraping Metrics

```bash
# Check Prometheus logs
kubectl logs -f deployment/prometheus -n monitoring

# Verify targets
kubectl port-forward svc/prometheus 9090:9090 -n monitoring
# Visit http://localhost:9090/targets

# Check if backend exposes /metrics
kubectl port-forward svc/sms-backend 5000:5000 -n school-management
curl http://localhost:5000/metrics
```

---

## 10. Security Best Practices

### 1. Secret Management

**Current**: Base64-encoded secrets in YAML (not secure for production)

**Recommended**:
```bash
# Use Sealed Secrets (encrypted secrets)
# Install kubeseal
brew install kubeseal

# Create sealed secret
kubectl create secret generic sms-secrets \
  --from-literal=jwt-secret='your-secret' \
  --from-literal=mongodb-uri='your-mongodb-uri' \
  --dry-run=client -o json | kubeseal \
  --controller-name=sealed-secrets \
  --controller-namespace=kube-system \
  --format yaml > sealed-secret.yaml

# Or use AWS Secrets Manager with External Secrets Operator
```

### 2. HTTPS Enforcement

The ingress is configured to redirect HTTP to HTTPS. To enable SSL:

```bash
# Request a certificate in AWS ACM
aws acm request-certificate \
  --domain-name "your-domain.com" \
  --validation-method DNS \
  --region us-east-1

# Validate the certificate (DNS validation)
# Add the CNAME record provided by ACM to your Route 53 hosted zone

# Update ingress with certificate ARN
# Edit deploy/kubernetes/ingress.yaml
# Uncomment: alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:...
```

### 3. JWT Storage

**Current**: JWT stored in localStorage (vulnerable to XSS)

**Recommended**: Move to HttpOnly, Secure, SameSite cookies
- Requires backend changes to set cookies on login
- Browser sends cookies automatically (no need for Authorization header)
- More secure against XSS attacks

### 4. Network Policies

Network policies are provided but should be applied after verifying the application works:

```bash
# Apply after testing
kubectl apply -f deploy/kubernetes/network-policies.yaml

# Monitor for issues
kubectl get networkpolicy -n school-management
```

### 5. Image Tagging

Use semantic versioning instead of `latest`:

```bash
# Build with version tag
docker build -t your-username/school-mgmt-backend:v1.0.0 .

# Deploy with specific version
kubectl set image deployment/sms-backend backend=your-username/school-mgmt-backend:v1.0.0 -n school-management

# Rollback if needed
kubectl rollout undo deployment/sms-backend -n school-management
```

### 6. Regular Updates

```bash
# Update EKS cluster
eksctl update cluster --name school-mgmt --region us-east-1

# Update node group
eksctl update nodegroup --name sms-nodes --cluster school-mgmt

# Update Kubernetes resources
kubectl apply -f deploy/kubernetes/
```

---

## Quick Reference Commands

```bash
# View all resources
kubectl get all -n school-management

# View logs
kubectl logs -f <pod-name> -n school-management

# Exec into pod
kubectl exec -it <pod-name> -n school-management -- sh

# Restart deployment
kubectl rollout restart deployment/<name> -n school-management

# Scale manually
kubectl scale deployment sms-backend --replicas=3 -n school-management

# Delete everything
kubectl delete namespace school-management
kubectl delete namespace monitoring

# Clean up EKS cluster
eksctl delete cluster --name school-mgmt --region us-east-1
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS EKS Cluster                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Internet-Facing ALB                     │   │
│  │         (Auto-provisioned by Ingress)                │   │
│  └────────────┬─────────────────────┬─────────────────┘   │
│               │                     │                       │
│      ┌────────▼────────┐   ┌────────▼────────┐            │
│      │   /api/*        │   │      /*         │            │
│      │   Backend       │   │   Frontend      │            │
│      │   Service:5000  │   │   Service:80    │            │
│      └────────┬────────┘   └────────┬────────┘            │
│               │                     │                       │
│      ┌────────▼────────┐   ┌────────▼────────┐            │
│      │  Backend Pods   │   │ Frontend Pods   │            │
│      │  (2-5 replicas) │   │  (2-5 replicas) │            │
│      │  Node.js/Express│   │  Nginx + React  │            │
│      └────────┬────────┘   └─────────────────┘            │
│               │                                            │
│      ┌────────▼────────┐                                  │
│      │  ConfigMap      │                                  │
│      │  Secrets        │                                  │
│      └─────────────────┘                                  │
└───────────────┬──────────────────────────────────────────┘
                │
       ┌────────▼─────────┐
       │  MongoDB Atlas   │
       │  (External DB)   │
       └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Monitoring (Optional)                     │
│  ┌──────────────┐          ┌──────────────┐                │
│  │  Prometheus  │◄─scrape──│  Backend     │                │
│  │  Port: 9090  │          │  /metrics    │                │
│  └──────┬───────┘          └──────────────┘                │
│         │                                                   │
│  ┌──────▼───────┐                                          │
│  │   Grafana    │◄── Dashboard: Node.js + App Metrics     │
│  │   Port: 3000 │                                          │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Kubernetes events: `kubectl describe pod <name> -n school-management`
- Check logs: `kubectl logs -f <pod-name> -n school-management`
- Visit the project repository for additional documentation
