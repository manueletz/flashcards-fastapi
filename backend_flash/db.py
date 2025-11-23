import oracledb

# Inicializamos el cliente Oracle en modo THICK
# (ruta donde tienes tu Instant Client)
oracledb.init_oracle_client(lib_dir="/opt/oracle/instantclient_23_3")

# Configura la conexión aquí
def get_connection():
    conn = oracledb.connect(
        user="ADMIN",
        password="Oracle90210.",
        dsn="atlasdb_high"
    )
    return conn
