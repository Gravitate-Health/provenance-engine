# provenance-engine

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

To only install resolved dependencies in `package-lock.json`:

```sh
npm ci
```

## Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3000 in your browser.

## Rebuild the project

To incrementally build the project:

```sh
npm run build
```

To force a full build by cleaning up cached artifacts:

```sh
npm run rebuild
```

## Fix code style and formatting issues

```sh
npm run lint
```

To automatically fix such issues:

```sh
npm run lint:fix
```

## Other useful commands

- `npm run migrate`: Migrate database schemas for models
- `npm run openapi-spec`: Generate OpenAPI spec into a file
- `npm run docker:build`: Build a Docker image for this application
- `npm run docker:run`: Run this application inside a Docker container

## Tests

```sh
npm test
```

## What's next

Please check out [LoopBack 4 documentation](https://loopback.io/doc/en/lb4/) to
understand how you can continue to add features to this application.

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

---

## Deployment

The service is packaged as a Helm chart located at `charts/provenance-engine/` and published to GitHub Container Registry (GHCR) as an OCI artifact on every push to `main` and every version tag (`v*`).

### Deploy via Helm (OCI)

No need to clone the repository — pull and install directly from the registry:

```bash
# Login to the registry (required for private packages)
helm registry login ghcr.io

# Install directly from GHCR
helm install my-release oci://ghcr.io/gravitate-health/charts/provenance-engine --version 0.1.0

# Install with custom values
helm install my-release oci://ghcr.io/gravitate-health/charts/provenance-engine \
  --version 0.1.0 \
  --set image.tag=0.3.0 \
  --set networking.type=istio
```

To upgrade an existing release:

```bash
helm upgrade my-release oci://ghcr.io/gravitate-health/charts/provenance-engine --version <new-version>
```

#### Networking modes

Set `networking.type` in your values to control how external traffic is routed:

| Value     | Behaviour |
|-----------|-----------|
| `istio`   | Creates an Istio `VirtualService` bound to an existing gateway (default) |
| `ingress` | Creates a standard Kubernetes `Ingress` resource |
| `none`    | No external routing resource is created |

Example — switch to standard Ingress:

```bash
helm install my-release oci://ghcr.io/gravitate-health/charts/provenance-engine \
  --version 0.1.0 \
  --set networking.type=ingress \
  --set networking.ingress.hostname=provenance.example.com
```

### Local Development

After cloning the repository, use the chart in `charts/provenance-engine/`:

```bash
# Lint the chart for errors
helm lint charts/provenance-engine

# Render templates locally without installing (useful for reviewing output)
helm template my-release charts/provenance-engine

# Render with custom values file
helm template my-release charts/provenance-engine -f my-values.yaml

# Dry-run install against a live cluster
helm install my-release charts/provenance-engine --dry-run --debug
```
