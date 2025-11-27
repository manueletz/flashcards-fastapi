import os
import oracledb

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
WALLET_DIR = os.getenv("WALLET_DIR")
WALLET_PASSWORD = os.getenv("WALLET_PASSWORD")

# Usa el alias que está en tu tnsnames.ora
DSN_NAME = "atlasdb_high"  # o el que realmente uses

def get_connection():
    return oracledb.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        dsn=DSN_NAME,
        config_dir=WALLET_DIR,
        wallet_location=WALLET_DIR,
        wallet_password=WALLET_PASSWORD,
    )
