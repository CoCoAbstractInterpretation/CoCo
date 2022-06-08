#!/bin/bash
package="$1"
target_path="$2"
version=$(npm show ${package} version)
archive="${package}-${version}.tgz"
curl --silent --remote-name \
  "https://registry.npmjs.org/${package}/-/${archive}"
mkdir "$target_path/${package}"
tar xzf "${archive}" --strip-components 1 -C "$target_path/${package}"
rm "${archive}"