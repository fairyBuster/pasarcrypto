#!/bin/sh
# ---------------------------------------------------------------------------
# hashed-chunk retention
#
# Every deploy rebuilds the bundle and renames every hashed chunk. A tab that
# was opened before the swap still asks for the old names when it opens another
# screen; if those files are gone the request is a 404 and the screen fails to
# load. The store lives on a volume, so copying without ever deleting keeps the
# previous builds reachable for a grace window. Hashed names never collide, so
# the only risk is disk growth, which the age prune below bounds.
# ---------------------------------------------------------------------------
set -eu

store="${ASSET_STORE:-/srv/assets}"
source_dir="/usr/share/nginx/html/assets"
retention_days="${ASSET_RETENTION_DAYS:-7}"
max_mb="${ASSET_STORE_MAX_MB:-512}"

mkdir -p "$store"
# `-a` keeps permissions and symlinks; `cp` alone would drop them
cp -a "$source_dir/." "$store/"

# the retention clock starts at this deploy: a copied file can carry an older
# mtime from the build context, and it must not be pruned while this build
# still serves it
(cd "$source_dir" && find . -type f -print0) | (cd "$store" && xargs -0 touch)

# chunks that no build in the window references anymore age out here
find "$store" -type f -mtime "+$retention_days" -delete 2>/dev/null || true

# a burst of deploys must not fill the volume: past the cap the oldest builds
# are dropped sooner, while the files just touched above are always spared
if [ "$(du -sm "$store" | cut -f1)" -gt "$max_mb" ]; then
  for minutes in 1440 360 60; do
    find "$store" -type f -mmin "+$minutes" -delete 2>/dev/null || true
    [ "$(du -sm "$store" | cut -f1)" -le "$max_mb" ] && break
  done
fi

echo "assets-retention: $(find "$store" -type f | wc -l) files, $(du -sm "$store" | cut -f1) MB, ${retention_days} day window, $store"
