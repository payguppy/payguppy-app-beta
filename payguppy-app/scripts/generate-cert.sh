#!/bin/bash

# Generate self-signed certificate for localhost development
# This enables HTTPS on localhost for camera access

echo "Generating self-signed certificate for localhost..."

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate private key
openssl genrsa -out certs/localhost-key.pem 2048

# Generate certificate
openssl req -new -x509 -key certs/localhost-key.pem -out certs/localhost.pem -days 365 -subj "/CN=localhost"

echo "Certificate generated successfully!"
echo "Files created:"
echo "  - certs/localhost-key.pem (private key)"
echo "  - certs/localhost.pem (certificate)"
echo ""
echo "To use HTTPS with Vite, update your vite.config.ts:"
echo "https: {"
echo "  key: fs.readFileSync('certs/localhost-key.pem'),"
echo "  cert: fs.readFileSync('certs/localhost.pem')"
echo "}"