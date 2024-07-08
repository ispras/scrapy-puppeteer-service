# Stress testing

This is a group of stress tests.
They are supposed to check service's operational limits.

## Launching

Use [artillery](https://www.artillery.io) to run these tests.

## Ram usage test

The test checks for maximum available contexts per 1 gigabyte of RAM.
Currently, it supports nearly 60 contexts per gigabyte.

## Sequential load test

The test checks for maximum available contexts for the service with

| Response time type | Response time |
|--------------------|---------------|
| mean               | <= 200ms      |
| p95                | <= 400ms      |
