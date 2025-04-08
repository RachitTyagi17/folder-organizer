import express from 'express';
import fs from 'fs';
import path from 'path';
import { moveFile } from 'move-file';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// Needed for __dirname with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend from /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// API route to organize files
app.post('/organize', async (req, res) => {
  const folderPath = req.body.folderPath;

  if (!folderPath || !fs.existsSync(folderPath)) {
    return res.json({ message: '❌ Folder path is invalid or does not exist.' });
  }

  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const ext = path.extname(file);
    if (!ext) continue;

    const folderName = ext.slice(1);
    const destinationFolder = path.join(folderPath, folderName);

    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }

    const sourcePath = path.join(folderPath, file);
    const destinationPath = path.join(destinationFolder, file);

    try {
      await moveFile(sourcePath, destinationPath);
    } catch (error) {
      return res.json({ message: `❌ Error moving file: ${file}` });
    }
  }

  res.json({ message: '✅ Folder organized successfully!' });
});

// Fallback to index.html for any route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
