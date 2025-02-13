# AMRIT - Inventory 

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)  

This repository contains the user interface (UI) design for an inventory management application. The UI is designed to provide a user-friendly and efficient way for users to manage their inventory and perform various inventory-related tasks.

### Features
* Dashboard: Displays an overview of inventory statistics, including total items, low stock alerts, and recent activity.
* Product Management: Allows users to add, edit, and delete products in the inventory.
* Inventory Tracking: Enables users to track the quantity and location of each item in the inventory.
* Stock Alerts: Provides notifications and alerts for low stock levels and out-of-stock items.
* Order Management: Allows users to create, track, and manage orders for replenishing inventory.
* Reporting: Provides reports and analytics on inventory performance, sales and trends.
* User Management: Allows administrators to manage user accounts and access permissions.

### Building from source 

1. To build deployable war files
```bash
mvn -B package --file pom.xml -P <profile_name>
```

The available profiles include dev, local, test, and ci.
Refer to `src/environments/environment.ci.template` file and ensure that the right environment variables are set for the build.

Packing with `ci` profile calls `build-ci` script in `package.json`.
It creates a `environment.ci.ts` file with all environment variables used in the generated build.

### Prerequisites 
* [Inventory-API](https://github.com/PSMRI/Inventory-API) module must be running
* JDK 17
* Nodejs v18.10.0
* MySQL

## Installation
This service has been tested on Wildfly as the application server.

## Filing Issues

If you encounter any issues, bugs, or have feature requests, please file them in the [main AMRIT repository](https://github.com/PSMRI/AMRIT/issues). Centralizing all feedback helps us streamline improvements and address concerns efficiently.  

## Join Our Community

We’d love to have you join our community discussions and get real-time support!  
Join our [Discord server](https://discord.gg/FVQWsf5ENS) to connect with contributors, ask questions, and stay updated.  
