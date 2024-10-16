source .env

# Wait for API at env var GRAPHQL_URL to be up by repeatedly pining /health for max 5 minutes
max_wait_time=300

api_url=$GRAPHQL_URL

#remove trailing slash if present
api_url=${api_url%/}

# Start the timer
start_time=$(date +%s)

echo "⏳ Waiting for GQL API at $api_url to be up before building GQL types..."
echo "⚠️ Wrong or missing GQL URL? Ensure GRAPHQL_URL is set in .env."
printf "\n"

while true; do
  # Ping the /health endpoint of the API
  response=$(curl -s -o /dev/null -w "%{http_code}" "$api_url/health")

  echo "- Got $response"

  if [ "$response" -eq 200 ]; then
    printf "\n"
    echo "✅ API is up! Building types..."
    printf "\n"
    break
  fi

  # Check if the maximum wait time is reached
  current_time=$(date +%s)
  elapsed_time=$((current_time - start_time))
  if [ "$elapsed_time" -ge "$max_wait_time" ]; then
    echo "Timeout: API did not come up within $max_wait_time seconds."
    exit 1
  fi

  sleep 1
done

# Purge any previously generated files
find . -regex './src/.*__generated__.*' -type d -prune -exec rm -r "{}" \;

# Generate new types according to ../codegen.ts
graphql-codegen
