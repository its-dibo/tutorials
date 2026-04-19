CREATE DATABASE app_name;

-- enable PostGIS extension in each database
\c app_name
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;


-- todo: create the default admin account