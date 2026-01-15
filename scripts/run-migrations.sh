#!/bin/bash

# Doctory Database Migration Script
# This script runs all SQL migrations against your Supabase database

echo "🏥 Doctory Database Migration"
echo "=============================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it in your .env.local file or export it:"
    echo "  export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres'"
    exit 1
fi

echo "📦 Running migrations..."
echo ""

# Run each migration in order
for migration in supabase/migrations/*.sql; do
    echo "▶️  Running: $migration"
    psql "$DATABASE_URL" -f "$migration"
    if [ $? -eq 0 ]; then
        echo "✅ Success: $migration"
    else
        echo "❌ Failed: $migration"
        echo "Please check the error above and fix before continuing."
        exit 1
    fi
    echo ""
done

echo "=============================="
echo "✅ All migrations completed!"
echo ""
echo "Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Test the application at http://localhost:3000"
