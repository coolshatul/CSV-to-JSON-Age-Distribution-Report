# CSV to JSON & Age Distribution Report

This Node.js application processes CSV files, uploads the data into a PostgreSQL database, and calculates an age distribution report. The CSV file is parsed, data is mapped to a database table, and then additional information is stored in JSON format. The app also computes the age distribution of the uploaded users and outputs the distribution in percentages.

## Features

- **CSV Parsing**: Reads a CSV file and maps its content to a database table.
- **Data Insertion**: Inserts parsed records into a PostgreSQL database.
- **Age Distribution Calculation**: Calculates the percentage distribution of user ages across defined age groups.
- **Flexible CSV Structure**: Handles CSV files with complex, nested properties.
- **PostgreSQL Database Integration**: Uses `pg` for database interaction.

## Table Schema

The application inserts data into the `users` table with the following structure:

```sql
CREATE TABLE public.users (
    name VARCHAR NOT NULL,          -- Concatenation of firstName and lastName
    age INT NOT NULL,               -- Age of the user
    address JSONB,                  -- Address stored as JSON
    additional_info JSONB,          -- Other fields stored as additional info in JSON
    id SERIAL PRIMARY KEY           -- Unique ID
);
```

## Prerequisites

- **Node.js** v14 or higher
- **PostgreSQL** database setup and running
- **CSV File** for processing (CSV file with headers)
- **Environment variables for database credentials and CSV file path**

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/csv-to-postgresql.git
cd csv-to-postgresql
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory of the project and set the following variables:

```env
CSV_FILE_PATH=./uploads/data.csv          # Path to your CSV file
DB_HOST=localhost                         # Database host (usually localhost)
DB_PORT=5432                              # Database port (default is 5432)
DB_USER=your_user                         # Database user
DB_PASSWORD=your_password                 # Database password
DB_NAME=your_database                     # Database name
```

### 4. Prepare PostgreSQL database

Make sure the PostgreSQL database is set up, and you have the necessary credentials. Run the following SQL script to create the required table:

```sql
CREATE TABLE public.users (
    name VARCHAR NOT NULL,
    age INT NOT NULL,
    address JSONB,
    additional_info JSONB,
    id SERIAL PRIMARY KEY
);
```

## Usage

### 1. Place your CSV file in the `uploads/` folder

Ensure your CSV file is placed in the `uploads/` directory of the project. The file should contain headers, and each row should represent a user with properties like `name.firstName`, `name.lastName`, `age`, `address.line1`, etc.

Example CSV:

```csv
name.firstName,name.lastName,age,address.line1,address.line2,address.city,address.state,gender
Rohit,Prasad,35,A-563 Rakshak Society,New Pune Road,Pune,Maharashtra,male
John,Doe,28,123 Elm St,Near Park,Delhi,Delhi,male
```

### 2. Start the server

Run the following command to start the server:

```bash
node server.js
```

### 3. Process the CSV file and upload data

Open your browser or use a tool like Postman to access the following endpoint:

```
GET http://localhost:3000/process
```

The server will:

- Parse the CSV file
- Insert records into the PostgreSQL database
- Calculate and log the age distribution of all users

### 4. Age Distribution Output

The server will output a report of the age distribution in the console:

```
Age-Group % Distribution
<20: 20%
20-40: 45%
40-60: 25%
>60: 10%
```

### 5. Check the Database

After the process is completed, check your PostgreSQL database for the newly inserted records in the `users` table.
