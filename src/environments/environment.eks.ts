// EKS Environment Configuration
// All requests go through the ALB (Application Load Balancer)
// Replace ALB_DNS_NAME with your actual ALB DNS from: kubectl get ingress -n pms

const ALB_ENDPOINT = window.location.origin; // Use same origin as frontend (ALB)

export const environment = {
  production: true,
  
  // All HTTP requests go through ALB -> API Gateway
  analytics: {
    baseHttp: ALB_ENDPOINT,  // ALB routes /api/* to API Gateway
    baseWs: ALB_ENDPOINT.replace('http', 'ws'),  // ALB routes /ws/* to API Gateway
  },
  
  leaderboard: {
    baseHttp: ALB_ENDPOINT,
    baseWs: ALB_ENDPOINT.replace('http', 'ws'),
  },
  
  rttm: {
    baseHttp: ALB_ENDPOINT,
    baseWs: ALB_ENDPOINT.replace('http', 'ws'),
  },
  
  portfolio: {
    baseHttp: ALB_ENDPOINT,
  },
  
  auth: {
    baseHttp: ALB_ENDPOINT,
  },
};
