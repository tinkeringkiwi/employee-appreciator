This folder contains Kubernetes manifests to run the application image published to GHCR.

Files
- `deployment.yaml` - Namespace, Deployment, Service, and Ingress using `letsencrypt-prod` ClusterIssuer.

How to use

1. Update the Ingress host

   Edit `kubernetes/deployment.yaml` and replace every occurrence of `app.example.com` with your real host.

2. Apply the manifests

   ```bash
   kubectl apply -f kubernetes/deployment.yaml
   ```

3. Wait for cert-manager to issue the certificate

   The Ingress uses `cert-manager` ClusterIssuer `letsencrypt-prod`. Ensure cert-manager and an appropriate ingress controller (e.g. nginx-ingress) are installed in the cluster.

Notes on image pull

- The CI publishes a public image to GHCR: `ghcr.io/tinkeringkiwi/employee-appreciator:latest`. No image pull secret is required for public images.
- If you change the image to a private repository later, create a docker-registry secret in the `employee-appreciator` namespace and add an `imagePullSecrets` entry to the Deployment.

Notes
- The Deployment runs the single multi-process image built by CI. The Service exposes two ports:
  - 80 -> frontend (containerPort 3000)
  - 5000 -> backend API (containerPort 5000)
- The Ingress routes `/api` to the API port and all other requests to the frontend.
- For production deployments consider splitting frontend and backend into separate containers/services and using a dedicated reverse-proxy or API gateway.
