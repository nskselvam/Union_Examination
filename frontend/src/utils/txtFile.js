const readCSVLineByLine = async (filePath) => {
  const results = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers = [];
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      // Parse headers from first line
      headers = line.split(",").map((header) => header.trim());
      isFirstLine = false;
    } else {
      // Parse data rows
      const values = line.split(",").map((value) => value.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      results.push(row);
      console.log("Processing row:", row);
    }
  }

  return results;
};
const parseCSVFromString = (csvString) => {
  const lines = csvString.split("\n");
  const results = [];
  let headers = [];

  lines.forEach((line, index) => {
    if (!line.trim()) return; // Skip empty lines

    // Parse data rows
    //    const values = line.split(',').map(value => value.trim());
    //      const row = {};
    // headers.forEach((header, idx) => {
    //   row[header] = values[idx] || '';
    // });
    results.push(line);
    //      console.log('Processing row:', row);
  });

  return results;
};
export { parseCSVFromString,readCSVLineByLine };
