const fs = require("fs").promises;

let path =
  "path/of/the/input/file.json";
let dest =
  "path/of/the/destination/folder";

var maxSize = 10000000;
var idealSize = 1000000;

// readFromFile(path: string): Promise<Object>
function readFromFile(path) {
  return path.split(".").pop() === "json"
    ? fs
        .stat(path)
        .then((stat) => stat.size)
        .then((size) => (size >= maxSize ? f(path, size) : addObjsToArray()))
    : Promise.reject(new Error("Not a JSON File"));
}
// readFromFile(path).then(console.log);

// fetchData(filePath:string, size:number, dest:string ) => Promise<void>
function fetchData(filePath, size, dest) {
  // constant for ratio of file sizes to improve the estimate of the file size.
  let coeff = -1; 
  // the array which will contain the data to be split
  let newData = [];
  // used for numbering the files
  let cnt = -1;
  return fs
    .readFile(filePath)
    .then((jsonData) => JSON.parse(jsonData)) // json => js object
    .then((data) => { if (!Array.isArray(data)) { return Promise.reject(new Error("The data is not an array")) }

      // ratio coefficent to make size approximation more accurate
      coeff = Buffer.byteLength(JSON.stringify(data)) / size;

      // loop until all the data is split
      while (!(JSON.stringify(data).length <= 4)) { // change 4 to something else depending on the data

        // adding the data into an object and then in the array
        newData.push({
          data: addObjsToArray([], data, coeff),  
          path: dest + "splitdata (" + (++cnt).toString() + ")" + ".json", // the file name
        });
      }
      return newData;
    })
    .then((data) =>
      data.forEach((obj) => {
        // write each data into a new, smaller file 
        fs.writeFile(obj.path, JSON.stringify(obj.data));
      })
    );
}

// addObjsToArray<T>(arr: T[], data: T, coeff: number, newData: T[]) => T[]
// stores parts of the data in similarly sized objects
function addObjsToArray(arr, data, coeff, newData) {
  // the data to add to the file
  let next = data.pop(); 

  // estimate of array size in bytes
  let arrSize = coeff * Buffer.byteLength(JSON.stringify(arr)); 

  // add the element to the array
  arr.push(next); 

  if (arrSize < idealSize) {
    // recursively call until enough elements are added
    return addObjsToArray(arr, data, coeff); 
  }

  return arr;
}

fetchData(path, 0, dest)
  .then((data) => console.log(data))
  .catch((err) => console.log(`Uhh, ${err}`));
