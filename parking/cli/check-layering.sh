#!/bin/sh
# Enforces the dependency rule in parking/README.md.
#
#   layer 0   contract     depends on nothing
#   layer 1   libraries    depend only on layer 0
#   layer 2   services     depend on layers 0 and 1
#
# A folder may require only from a strictly lower layer. Nothing may require a
# service, because there is no layer 3. Exits non-zero on a violation so that CI
# can use it as a gate — without one, folder boundaries become decoration within
# a month.

set -eu
cd "$(dirname "$0")/.."

layer_of() {
  case "$1" in
    contract)                    echo 0 ;;
    identity|logger|collector)   echo 1 ;;
    sensor|app|journal|time|cli) echo 2 ;;
    *)                           echo - ;;
  esac
}

violations=0

for file in $(find . -name '*.js' -not -path '*/node_modules/*'); do
  from=$(echo "$file" | cut -d/ -f2)
  from_layer=$(layer_of "$from")
  if [ "$from_layer" = "-" ]; then continue; fi

  for to in $(grep -oE "require\('\.\./[a-z-]+" "$file" | sed "s|require('\.\./||" | sort -u || true); do
    to_layer=$(layer_of "$to")
    if [ "$to_layer" = "-" ]; then continue; fi
    if [ "$to_layer" -ge "$from_layer" ]; then
      echo "layering violation: $from/ (layer $from_layer) requires $to/ (layer $to_layer)"
      echo "  in $file"
      violations=$((violations + 1))
    fi
  done
done

if [ "$violations" -gt 0 ]; then
  echo
  echo "$violations violation(s); see the dependency rule in parking/README.md"
  exit 1
fi

echo "layering ok"
