import express from 'express';
import fs from 'fs';
import path from 'path';
import { moveFile } from 'move-file';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('.')); // Serve index.html from current folder

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
