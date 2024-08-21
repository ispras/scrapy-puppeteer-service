#!/bin/bash

echo "Starting VNC server at $RESOLUTION..."
vncserver -kill :1 || true
vncserver -geometry "${RESOLUTION}" &
echo "VNC server started at ${RESOLUTION}! ^-^"

tail -f /dev/null
