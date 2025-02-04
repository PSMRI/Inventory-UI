# AMRIT - Inventory 
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)  

This repository contains the user interface (UI) design for an inventory management application. The UI is designed to provide a user-friendly and efficient way for users to manage their inventory and perform various inventory-related tasks.

### Features
* Dashboard: Offers a comprehensive overview of inventory, including total items, low-stock alerts, and recent activity.
* Product Management: Enables adding, editing, and removing products efficiently.
* Inventory Tracking: Monitors stock levels and item locations in real time.
* Stock Alerts: Sends notifications for low or out-of-stock items.
* Order Management: Facilitates order creation, tracking, and inventory restocking.
* Reporting & Analytics: Generates insights on inventory performance, sales trends, and stock movement.
* User Management: Controls user roles, access levels, and administrative permissions.

### Prerequisites 
* [Inventory-API](https://github.com/PSMRI/Inventory-API) module must be running
* JDK 17
* Nodejs v18.10.0
* MySQL

### Building from Source

1. **Generate Deployable WAR Files**
   ```bash
   mvn -B package --file pom.xml -P <profile_name>
   ```
   Available profiles: `dev`, `local`, `test`, and `ci`.  
   
2. **Configure Environment Variables**
   Ensure that the correct environment variables are set by referring to the `src/environments/environment.ci.template` file. 

3. **CI Profile Specifics**
   Using the `ci` profile triggers the `build-ci` script from `package.json`.  
   This script generates an `environment.ci.ts` file, embedding all necessary environment variables for the build.

For steps to clone and set up the UI Repository, refer to the [Developer Guide](https://piramal-swasthya.gitbook.io/amrit/developer-guide/development-environment-setup/installation-instructions/for-ui-repositories)


## Installation
This service has been tested on Wildfly as the application server.

## Filing Issues

If you encounter any issues, bugs, or have feature requests, please file them in the [main AMRIT repository](https://github.com/PSMRI/AMRIT/issues). Centralizing all feedback helps us streamline improvements and address concerns efficiently.  

## Join Our Community

We’d love to have you join our community discussions and get real-time support!  
Join our [Discord server](https://discord.gg/FVQWsf5ENS) to connect with contributors, ask questions, and stay updated.  


## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/devikasuresh20"><img src="https://avatars.githubusercontent.com/u/57424483?v=4?s=100" width="100px;" alt="Devika S"/><br /><sub><b>Devika S</b></sub></a><br /><a href="https://github.com/PSMRI/Inventory-UI/commits?author=devikasuresh20" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!