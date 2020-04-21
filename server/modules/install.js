const fs = require('fs')
const link = 'node_modules/@elementarium';
const source = '../modules';

console.log('Creating symlinks ...')
if (fs.existsSync(link)) {
    console.log('link exists already ');
} else {
    console.log(`creating link for ${source}`);
    fs.symlinkSync(source, link, 'junction');
    console.log('done');
}