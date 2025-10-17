#!/bin/bash

# Start VNC server if puppeteer is headfull
if [ "${HEADLESS}" == "false" ]; then
  printf "%s\n%s\nn" "${VNC_PASSWORD:=password}" "${VNC_PASSWORD:=password}" | vncpasswd
  ./start_vnc.sh &
  websockify -D 5900 localhost:5901 --web /usr/share/novnc
fi

# Start scrapy-puppeteer-service
yarn start ${BROWSER_EXTRA_ARGS}

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
