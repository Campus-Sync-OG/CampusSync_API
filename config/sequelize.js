const { Sequelize } = require("sequelize");
 
// Load configuration (replace these with your actual Azure PostgreSQL credentials)
const config = {
  username: "zaroor",
  password: "Karthik@0306",
  database: "schooldb_prod",
  host: "locateus-projects.postgres.database.azure.com",
  port: 5432, // Default PostgreSQL port
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // Enforce SSL
      rejectUnauthorized: false, // For self-signed certificates
    },
  },
};
 
// Initialize Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: console.log, // Optional: Enable or disable query logging
  }
);
 
// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to the PostgreSQL database successfully.");
   
    // Sync all models 
    await sequelize.sync({ alter: false });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
module.exports = sequelize;
