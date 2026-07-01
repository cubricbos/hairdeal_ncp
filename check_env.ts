import fs from 'fs';

try {
  if (fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf-8').split('\n');
    console.log("Keys in .env:");
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const parts = line.split('=');
        console.log(`- ${parts[0]}`);
      }
    }
  } else {
    console.log(".env file does NOT exist.");
  }
} catch (err: any) {
  console.log("Error reading .env:", err.message);
}
