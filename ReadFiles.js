"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
function readFileList(dir) {
    var files = fs_1.default.readdirSync(dir);
    files.forEach(function (item, index) {
        var fullPath = path_1.default.join(dir, item);
        var stat = fs_1.default.statSync(fullPath);
        if (stat.isDirectory()) {
            readFileList(fullPath);
        }
        else {
            writeBuffer(fullPath);
        }
    });
}
var content = "";
function writeBuffer(file) {
    var filename = path_1.default.basename(file);
    // console.log(tmppath);
    content += filename + "{:::::}" + fs_1.default.readFileSync(file) + "{|||||}";
}
var c = path_1.default.resolve("/mnt/e/_MjProj/server/src");
readFileList(c);
var filebyte = Buffer.from(content, "binary");
var b1 = Buffer.alloc(10);
b1.writeBigInt64BE(12353434352353n);
b1.writeInt32BE(132553534, 6);
var b2 = Buffer.concat([b1, filebyte]);
var d = path_1.default.resolve(__dirname, "file.bin");
fs_1.default.writeFileSync(d, b2);
// let files:string[] = content.split("{|||||}");
// for (let file of files)
// {
//     let [name, content] = file.split("{:::::}");
//     if (content)
//     {
//         let tmppath = path.resolve(__dirname, "out");
//         if (!fs.existsSync(tmppath))
//         {
//             fs.mkdirSync(tmppath);
//         }
//         let tmpname = path.resolve(tmppath, name);
//         fs.writeFileSync(tmpname, content, {flag:"w"});
//     }
// }
// console.log(content);
// const key = '0132456789abcdef'
// const iv = 'fedcba9876543210'
// function cipher(str, key, iv){ 
//   try {
//     const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
//     return cipher.update(str, 'utf8', 'hex') + cipher.final('hex');
//   } catch(err) {
//     console.log('加密失败');
//     return err.message || err;
//   }
// }
// function decipher(str, key, iv){
//   try {
//     const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
//     return decipher.update(str, 'hex', 'utf8') + decipher.final('utf8');
//   } catch(err) {
//     console.log('解密失败');
//     return err.message || err;
//   }
// }
// const cipherStr = cipher('毛茸茸的金毛春卷贼能吃,每天要吃1斤狗粮', key, iv);
// console.log(cipherStr); // b963135b1b28ca318817230c1e3037f10e5febc584839e3792d72626d9566d01c893667a2de00b617d81afade4ea0cba93b25cd111ca216ebca00b35b42748d7
// const decipherStr = decipher(cipherStr, key, iv);
// console.log(decipherStr); // 毛茸茸的金毛春卷贼能吃,每天要吃1斤狗粮
