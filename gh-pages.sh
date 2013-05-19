#!/bin/bash
DIR=dist
parent_sha=$(git show-ref -s refs/heads/gh-pages)
doc_sha=$(git ls-tree -d HEAD "$DIR" | awk '{print $3}')
new_commit=$(echo "Auto-update docs." | git commit-tree $doc_sha -p $parent_sha)
git update-ref refs/heads/gh-pages $new_commit
