#!/bin/bash
DOCKER_COMPOSE_FILE=$PWD/docker/docker-compose.yaml

DOCKER_BUILDKIT=0 docker compose -f $DOCKER_COMPOSE_FILE -p broker-cli up --build --abort-on-container-exit --remove-orphans
