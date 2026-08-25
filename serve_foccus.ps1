# Serve the Foccus application locally
# This PowerShell script starts a simple HTTP server on port 8000 serving the current directory.
# Requires Python to be installed and available in PATH.

$port = 8000
Write-Host "Starting local HTTP server on http://localhost:$port/"
python -m http.server $port --directory .
