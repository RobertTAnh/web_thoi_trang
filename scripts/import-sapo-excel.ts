import path from "path";
import { importSapoExcelFile } from "../src/lib/sapo/excel-import";

async function main() {
  const arg = process.argv[2];
  const filePath =
    arg ||
    path.join(
      process.cwd(),
      "Copy of danh_sach_san_pham_10.08.2026_9149c234731fe282148104053f8b346d.xlsx",
    );

  console.log("Importing:", filePath);
  const result = await importSapoExcelFile(filePath);
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length) {
    console.error(`Completed with ${result.errors.length} errors`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
