#!/bin/bash

# Supabase project details
PROJECT_ID="heyaknwrcuskmwwefsiy"
SUPABASE_URL="https://heyaknwrcuskmwwefsiy.supabase.co"

# Get service role key (you'll need to provide this)
echo "⚠️  To run migrations, we need your Supabase service role key."
echo "Get it from: https://app.supabase.com/project/$PROJECT_ID/settings/api"
echo ""
read -p "Enter your SUPABASE_SERVICE_ROLE_KEY: " SERVICE_ROLE_KEY

# Function to execute SQL
execute_sql() {
  local sql_file=$1
  echo "Running migration: $sql_file"
  
  local sql_content=$(cat "$sql_file")
  
  curl -X POST "$SUPABASE_URL/rest/v1/rpc/sql_query" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$sql_content" | jq -Rs .)}" \
    2>/dev/null
    
  echo ""
}

# Run all migrations in order
for migration in supabase/migrations/*.sql; do
  execute_sql "$migration"
done

echo "✅ Migrations completed!"
