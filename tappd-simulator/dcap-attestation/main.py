#!/usr/bin/env python

from dotenv import load_dotenv

load_dotenv()

print("I AM STARTING")
from dcap_attestation.api import app
