#!/usr/bin/env sh

USER="pi"
PASSWORD="raspberry"
HOST="brauag.fritz.box"

SRC_PATH="~/tilt"
FILES="*.csv"
DEST_PATH = "."

scp $USER@$HOST:$SRC_PATH/$FILES $DEST_PATH
