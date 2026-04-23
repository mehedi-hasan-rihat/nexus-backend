import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const distDir = "./dist";

function fixImports(dir) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
        const fullPath = join(dir, entry);
        if (statSync(fullPath).isDirectory()) {
            fixImports(fullPath);
        } else if (entry.endsWith(".js")) {
            let content = readFileSync(fullPath, "utf8");
            // add .js to relative imports that don't already have an extension
            content = content.replace(/(from\s+['"])(\.\.?\/[^'"]+)(?<!\.js)(['"])/g, "$1$2.js$3");
            writeFileSync(fullPath, content);
        }
    }
}

fixImports(distDir);
console.log("✔ Fixed imports in dist/");
