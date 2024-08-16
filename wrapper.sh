#!/bin/bash

# Start the first process
#expect -c 'spawn ./start-vnc.sh; expect "Password: "; send "password\r"; expect "Verify: "; send "password\r"; interact' &
./start-vnc.sh &

sleep 10

# Start the second process
yarn start

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
