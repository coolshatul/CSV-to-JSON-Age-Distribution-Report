require("dotenv").config();
const express = require("express");
const fs = require("fs");
const { Pool } = require("pg");

// Initialize PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Create Express app
const app = express();
const PORT = 3000;

// Utility: Parse a CSV file
async function parseCsv(filePath) {
  const fileStream = fs.createReadStream(filePath, "utf-8");
  const lines = [];
  let headers = [];
  let isFirstLine = true;
  let buffer = "";

  return new Promise((resolve, reject) => {
    fileStream.on("data", (chunk) => {
      buffer += chunk;
      let lineEndIndex;

      while ((lineEndIndex = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, lineEndIndex).trim();
        buffer = buffer.slice(lineEndIndex + 1);

        if (line) {
          if (isFirstLine) {
            headers = line.split(",").map((header) => header.trim());
            isFirstLine = false;
          } else {
            const values = line.split(",");
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index]?.trim();
            });
            lines.push(row);
          }
        }
      }
    });

    fileStream.on("end", () => resolve(lines));
    fileStream.on("error", (err) => reject(err));
  });
}

// Utility: Insert records into the database
async function insertRecords(records) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const record of records) {
      const additionalInfo = {};
      let name = "";
      let age = 0;
      const address = {};

      for (const [key, value] of Object.entries(record)) {
        if (key.startsWith("name.")) {
          name += `${value} `;
        } else if (key === "age") {
          age = parseInt(value, 10);
        } else if (key.startsWith("address.")) {
          const addrKey = key.split(".")[1];
          address[addrKey] = value;
        } else {
          additionalInfo[key] = value;
        }
      }

      name = name.trim();

      // Insert into the database
      await client.query(
        `INSERT INTO users (name, age, address, additional_info) 
                VALUES ($1, $2, $3, $4)`,
        [name, age, JSON.stringify(address), JSON.stringify(additionalInfo)]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error inserting records:", error);
  } finally {
    client.release();
  }
}

// Utility: Calculate age distribution
async function calculateAgeDistribution() {
  const client = await pool.connect();

  try {
    const result = await client.query("SELECT age FROM users");
    const ageGroups = { "<20": 0, "20-40": 0, "40-60": 0, ">60": 0 };

    result.rows.forEach(({ age }) => {
      if (age < 20) {
        ageGroups["<20"]++;
      } else if (age >= 20 && age <= 40) {
        ageGroups["20-40"]++;
      } else if (age >= 40 && age <= 60) {
        ageGroups["40-60"]++;
      } else {
        ageGroups[">60"]++;
      }
    });

    const total = Object.values(ageGroups).reduce(
      (acc, count) => acc + count,
      0
    );
    console.log("Age-Group % Distribution");
    for (const [group, count] of Object.entries(ageGroups)) {
      console.log(`${group}: ${(count / total) * 100}%`);
    }
  } finally {
    client.release();
  }
}

// Endpoint to process CSV and upload to DB
app.get("/process", async (req, res) => {
  const filePath = process.env.CSV_FILE_PATH;

  try {
    const records = await parseCsv(filePath);
    console.log(records);

    await insertRecords(records);
    await calculateAgeDistribution();
    res.send("CSV processed and data uploaded successfully!");
  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).send("Failed to process CSV");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
