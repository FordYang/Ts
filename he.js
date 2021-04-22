"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readFileList(dir) {
	    const files = fs_1.default.readdirSync(dir);
	    files.forEach((item, index) => {
		            var fullPath = path_1.default.join(dir, item);
		            const stat = fs_1.default.statSync(fullPath);
		            if (stat.isDirectory()) {
				                readFileList(fullPath);
				            }
		            else {
				                writeBuffer(fullPath);
				            }
		        });
}
let content = "";
function writeBuffer(file) {
	    let filename = path_1.default.basename(file);
	    content += filename + "{:::::}" + fs_1.default.readFileSync(file) + "{|||||}";
}
let c = path_1.default.resolve("/mnt/e/_MjProj/server/src");
readFileList(c);
let filebyte = Buffer.from(content);
let d = path_1.default.resolve(__dirname, "file1.bin");
fs_1.default.writeFileSync(d, filebyte);
//# sourceMappingURL=ReadFiles.js.map
