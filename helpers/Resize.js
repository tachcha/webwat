const sharp = require("sharp");
const uuidv4 = require("uuid/v4");
const path = require("path");

class Resize {
  constructor(folder, options) {
    this.folder = folder;
    this.width = options.width;
    this.height = options.height;
  }
  async save(buffer) {
    const filename = Resize.filename();
    const filepath = this.filepath(filename);

    await sharp(buffer)
      .resize(this.width, this.height, {
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .toFile(filepath);

    return filename;
  }
  static filename() {
    return `${uuidv4()}.png`;
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`);
  }
}
export default Resize;
