//Configure TypeORM and Database Connection
//TypeORM Configuration
// ormconfig.json
{
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "password",
    "database": "rbac_demo",
    "synchronize": true,
    "logging": false,
    "entities": [
      "src/models/**/*.ts"
    ]
  }