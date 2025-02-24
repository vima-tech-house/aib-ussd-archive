# AIB Backend - USSD

<h1>
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="65" alt="Nest Logo" />
  </a>
</h1>

## Table of Contents

<details>
<summary>Expand / collapse contents</summary>

- [Description](#description)
- [Features](#features)
- [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [PostgreSQL Setup](#postgresql-setup)
  - [Development Setup](#development-setup)
- [API Documentation](#api-documentation)
- [Database Management](#database-management)
- [Authentication](#authentication)
- [Development Tools](#development-tools)

</details>

## Description

Backend API for Alliance Insurance Brokers platform, developed by VTG Hub Africa. This project handles insurance services management, including policy calculations, payments processing, and client management.

### Features

- Complete insurance management system with:
  - Premium calculations and quotations
  - Policy management
  - Payment processing (Mobile Money & Cards)
  - Client management
  - Vehicle information handling
  - Report generation
- Secure authentication with JWT
- Role-based access control
- USSD integration
- Mobile money integration
- Automated invoice generation
- Real-time analytics
- Multi-language support

## Installation

```bash
# Install dependencies
yarn install

# Development
yarn start:dev

# Production build
yarn build:prod

# Production start
yarn start:prod
```

## Service Local Setup

**1. Create a `.env.development` file with at least the following variables:**

- DATABASE_HOST
- DATABASE_USERNAME
- DATABASE_PASSWORD
- DATABASE_NAME_DEV

Tip: Refer to the `.venv.example` file in the repository for additional optional variables that can be included based on your setup.

**2. Install the required packages:**

```bash
yarn install
```

**3. Run Database Migrations:**

```bash
yarn run migrate:all
```

**4. Start the service:**

```bash
yarn start:dev
```
