#!/bin/bash
#
# Usage: run from project directory: ./scripts/open_swagger_ui.sh
# Description: run docker with openapi.yml & open browser with swagger_ui
# Prerequisites: docker
# 

. $(dirname "$0")/common.sh

# run swagger-ui container with the yaml if not running yet
# 
name='swagger-ui'
command -v docker >/dev/null 2>&1 || { echo >&2 "'docker' is not installed. Aborting."; exit 1; }
[[ $(docker ps -f "name=$name" --format '{{.Names}}') == $name ]] ||
docker run --rm -d -p 8045:8080 --name "$name" -v $(pwd)/config:/config -e SWAGGER_FILE=/config/openapi.yml swaggerapi/swagger-ui

wait_container_to_be_running "$name" & sleep 2

# open swagger-ui in browser
xdg-open http://localhost:8045