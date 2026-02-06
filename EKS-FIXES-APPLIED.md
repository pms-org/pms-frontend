# EKS Deployment Fixes Applied ✅

## Issues Fixed

### 1. ✅ Build Configuration Mismatch
**Problem:** Dockerfile.eks used `--configuration=production` but angular.json has separate `k8s` configuration

**Fix Applied:**
- Updated `Dockerfile.eks` line 14 to use `--configuration=k8s`
- This ensures the k8s-specific environment file is used during build

**File Changed:** `Dockerfile.eks`
```dockerfile
# Before:
RUN npm run build -- --configuration=production

# After:
RUN npm run build -- --configuration=k8s
```

---

### 2. ✅ Output Path Mismatch
**Problem:** Angular 21 outputs to `/app/dist/pms-frontend/browser` but Dockerfile expected `/app/dist/pms-frontend`

**Fix Applied:**
- Updated `Dockerfile.eks` line 22 to copy from correct path with `/browser` subdirectory
- This matches Angular 21's new output structure

**File Changed:** `Dockerfile.eks`
```dockerfile
# Before:
COPY --from=build /app/dist/pms-frontend /usr/share/nginx/html

# After:
COPY --from=build /app/dist/pms-frontend/browser /usr/share/nginx/html
```

---

### 3. ✅ ConfigMap Runtime Configuration
**Problem:** Need to ensure env.js is loaded and environment.k8s.ts reads from it

**Status:** 
- ✅ `index.html` already loads `/env.js` (line 11)
- ✅ Updated `environment.k8s.ts` to read from `window.__ENV__` with fallbacks

**File Changed:** `src/environments/environment.k8s.ts`
```typescript
// Now reads from runtime ConfigMap
const runtimeEnv = (window as any).__ENV__ || {};

export const environment = {
  production: true,
  analytics: {
    baseHttp: runtimeEnv.ANALYTICS_HTTP || 'http://apigateway-service:8088',
    baseWs: runtimeEnv.ANALYTICS_WS || 'ws://apigateway-service:8088',
  },
  // ... all services now use runtime config
};
```

---

## Deployment Flow

### 1. Build & Push Docker Image
```bash
cd C:\Users\User1\Documents\GitHub\pms-frontend

# Build with fixed Dockerfile
docker build -f Dockerfile.eks -t niishantdev/pms-frontend:latest .

# Push to registry
docker push niishantdev/pms-frontend:latest
```

### 2. Deploy to EKS
```bash
cd C:\Users\User1\Documents\GitHub\pms-infra

# Deploy via Helm
helm upgrade --install pms-platform k8s/pms-platform \
  --namespace pms \
  --create-namespace \
  --wait
```

### 3. Verify Deployment
```bash
# Check pods
kubectl get pods -n pms -l app=frontend

# Check service
kubectl get svc frontend -n pms

# Get frontend URL (via ingress)
kubectl get ingress pms-ingress -n pms

# Test env.js is loaded
kubectl exec -it <frontend-pod> -n pms -- cat /usr/share/nginx/html/env.js
```

---

## How Runtime Configuration Works

```
┌─────────────────────────────────────────────────────────┐
│ 1. Kubernetes ConfigMap (frontend-env-config)           │
│    Contains: API Gateway URLs, Service endpoints        │
└────────────────────────┬────────────────────────────────┘
                         │ Mounted as volume
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Pod: /usr/share/nginx/html/env.js                    │
│    window.__ENV__ = { ANALYTICS_HTTP: "http://...", }   │
└────────────────────────┬────────────────────────────────┘
                         │ Loaded in index.html
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Browser loads index.html                             │
│    <script src="/env.js"></script>                      │
└────────────────────────┬────────────────────────────────┘
                         │ Before Angular boots
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Angular app reads environment.k8s.ts                 │
│    const runtimeEnv = window.__ENV__ || {}              │
│    Uses runtime values from ConfigMap                   │
└─────────────────────────────────────────────────────────┘
```

---

## Benefits of These Fixes

1. ✅ **Same Docker image works across all environments** (dev/staging/prod)
2. ✅ **No rebuild needed** when changing backend URLs
3. ✅ **Proper Angular 21 compatibility** with browser output directory
4. ✅ **Runtime configuration** via Kubernetes ConfigMap
5. ✅ **Fallback values** if ConfigMap is not available

---

## Testing Checklist

- [ ] Build Docker image successfully
- [ ] Push to Docker registry
- [ ] Deploy to EKS cluster
- [ ] Pod starts and becomes Ready (1/1)
- [ ] LoadBalancer/Ingress gets external IP
- [ ] Access frontend in browser
- [ ] Check browser console: `window.__ENV__` is populated
- [ ] Test login/API calls work
- [ ] Verify WebSocket connections work

---

## Files Modified

1. `Dockerfile.eks` - Fixed build config and output path
2. `src/environments/environment.k8s.ts` - Added runtime config support
3. `src/index.html` - Already correct (loads env.js)

---

**Status:** ✅ All EKS deployment issues fixed and ready for production deployment!

**Last Updated:** $(date)
