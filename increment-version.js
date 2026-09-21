import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFilePath = path.join(__dirname, 'src', 'version.json');

try {
  if (fs.existsSync(versionFilePath)) {
    const fileContent = fs.readFileSync(versionFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    const currentVersion = parseFloat(data.version) || 1.0;
    const nextVersion = (currentVersion + 0.1).toFixed(1);
    data.version = nextVersion;
    fs.writeFileSync(versionFilePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`[Version Control] Version incremented successfully to v${nextVersion}`);
  } else {
    fs.writeFileSync(versionFilePath, JSON.stringify({ version: "1.0" }, null, 2) + '\n');
    console.log(`[Version Control] Initialized version.json with v1.0`);
  }
} catch (error) {
  console.error('[Version Control] Failed to increment version:', error);
}
