#!/bin/bash

# Check current status
echo "--- Current Git Status ---"
git status

# Ask for commit message
echo ""
echo "Enter commit message (or press enter to cancel):"
read commit_message

if [ -z "$commit_message" ]; then
    echo "Commit cancelled: No message provided."
    exit 0
fi

# Add all changes
echo "Adding changes..."
git add .

# Commit changes
echo "Committing with message: $commit_message"
if git commit -m "$commit_message"; then
    echo ""
    echo "--- Commit Successful ---"
    echo ""
    echo "Last 5 commits:"
    git log -n 5 --oneline --graph --decorate
else
    echo "Commit failed."
    exit 1
fi
