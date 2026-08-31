import fs from "fs/promises";
import path from "path";

const src = path.join(process.cwd(), "src", "dashboard");
const dest = path.join(process.cwd(), "dist", "dashboard");

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function copyRecursive(srcDir, destDir) {
  if (!(await exists(srcDir))) return;
  await fs.rm(destDir, { recursive: true, force: true });
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyRecursive(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const link = await fs.readlink(srcPath);
      await fs.symlink(link, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

(async () => {
  try {
    await copyRecursive(src, dest);
    console.log(`copied ${src} -> ${dest}`);
  } catch (err) {
    console.error("copy-static failed:", err);
    process.exitCode = 1;
  }
})();
