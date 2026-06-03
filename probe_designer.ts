import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const coreUrl = process.env.CORE_SERVER_URL || 'http://hairdeal.cubric.io/api';

async function run() {
  console.log("Checking Admin Designer...");
  try {
     // I will use my account admin login first? Oh, I need an admin token. I don't have it.
     // Is there any bypass if I provide an empty token? No.
  } catch(e: any) {
     console.log(e.message);
  }
}
run();
