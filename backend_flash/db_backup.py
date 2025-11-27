# db.py
import os
import oracledb

# -------------------------------
# 1. Leer variables de entorno
# -------------------------------
WALLET_DIR = os.environ.get("WALLET_DIR")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
WALLET_PASSWORD = os.environ.get("WALLET_PASSWORD")

# -------------------------------
# 2. Validaciones
# -------------------------------
missing = []

if not WALLET_DIR:
    missing.append("WALLET_DIR")

if not DB_USER:
    missing.append("DB_USER")

if not DB_PASSWORD:
    missing.append("DB_PASSWORD")

if not WALLET_PASSWORD:
    missing.append("WALLET_PASSWORD")

if missing:
    raise RuntimeError(
        f"Las siguientes variables de entorno no están definidas: {', '.join(missing)}"
    )

# -------------------------------
# 3. Función de conexión THIN + WALLET
# -------------------------------
def get_connection():
    """
    Conexión en modo THIN usando wallet (mTLS).
    Utiliza el alias definido en tnsnames.ora (atlasdb_high).
    """
    dsn = "atlasdb_high"

    return oracledb.connect(
        user=DB_USER,
        password=DB_PASSWORD,
        dsn=dsn,
        config_dir=WALLET_DIR,
        wallet_location=WALLET_DIR,
        wallet_password=WALLET_PASSWORD,
    )
