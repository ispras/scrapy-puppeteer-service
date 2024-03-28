#!/bin/sh

until curl -X GET -f -LI "logstash:9600" -s -o /dev/null; do
  >&2 echo "Logstash is unavailable - sleeping";
  sleep 1;
done
>&2 echo "Logstash is up";
sleep 1;
