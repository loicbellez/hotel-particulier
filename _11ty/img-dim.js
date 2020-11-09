
const { JSDOM } = require("jsdom");
const { promisify } = require("util");
const sizeOf = promisify(require("image-size"));
const blurryPlaceholder = require("./blurry-placeholder");
const srcset = require("./srcset");
const path = require("path");

const ACTIVATE_AVIF = false;


const processImage = async (img, outputPath) => {
  let src = img.getAttribute("src");
  if (/^(https?\:\/\/|\/\/)/i.test(src)) {
    return;
  }
  if (/^\.+\//.test(src)) {
    // resolve relative URL
    src =
      "/" +
      path.relative("./_site/", path.resolve(path.dirname(outputPath), src));
  }
  let dimensions;
  try {
    dimensions = await sizeOf("_site/" + src);
  } catch (e) {
    console.warn(e.message, src);
    return;
  }
  if (!img.getAttribute("width")) {
    img.setAttribute("width", dimensions.width);
    img.setAttribute("height", dimensions.height);
  }
  if (dimensions.type == "svg") {
    return;
  }
  if (img.tagName == "IMG") {
    // img.setAttribute("decoding", "async");
    // img.setAttribute("loading", "lazy");
    // Contain the intrinsic to the `--main-width` (width of the main article body)
    // and the aspect ratio times that size. But because images are `max-width: 100%`
    // use the `min` operator to set the actual dimensions of the image as the
    // ceiling 🤯.
    const containSize = `min(var(--main-width), ${
      dimensions.width
    }px) min(calc(var(--main-width) * ${
      dimensions.height / dimensions.width
    }), ${dimensions.height}px)`;
    // img.setAttribute(
    //   "style",
    //   `background-size:cover;` +
    //     `contain-intrinsic-size: ${containSize};` +
    //     `background-image:url("${await blurryPlaceholder(src)}")`
    // );
    const doc = img.ownerDocument;

    const picture = doc.createElement("amp-img");
    //picture.setAttribute("src", await srcset(src, "webp"));

    var src_webp = src.replace(".jpg", "-1920w.webp");

    picture.setAttribute("src", src_webp);
    picture.setAttribute("layout", "responsive");
    await setSrcset(picture, src, "webp");

    picture.setAttribute("width","1920"); // original:640
    picture.setAttribute("height","900"); // original:457

    // fallback jpg below

    const picturejpg = doc.createElement("amp-img");
    var src_jpg = src.replace(".jpg", "-1920w.jpg");
    picturejpg.setAttribute("fallback","");
    picturejpg.setAttribute("src", src_jpg);
    picturejpg.setAttribute("layout", "responsive");
    await setSrcset(picturejpg, src, "jpeg");

    picturejpg.setAttribute("width","1920");
    picturejpg.setAttribute("height","900");

    picture.appendChild(picturejpg);


    // const avif = doc.createElement("source");
    // const webp = doc.createElement("source");
    // const jpeg = doc.createElement("source");
    //
    // if (ACTIVATE_AVIF) {
    //   await setSrcset(avif, src, "avif");
    // }
    //
    // avif.setAttribute("type", "image/avif");
    // await setSrcset(webp, src, "webp");
    // webp.setAttribute("type", "image/webp");
    // await setSrcset(jpeg, src, "jpeg");
    // jpeg.setAttribute("type", "image/jpeg");
    // if (ACTIVATE_AVIF) {
    //   picture.appendChild(avif);
    // }
    // picture.appendChild(webp);
    // picture.appendChild(jpeg);
    img.parentElement.replaceChild(picture, img);
    //picture.appendChild(img);
  } else if (!img.getAttribute("srcset")) {
    await setSrcset(img, src, "jpeg");
  }
};

async function setSrcset(img, src, format) {
  img.setAttribute("srcset", await srcset(src, format));
  img.setAttribute(
    "sizes",
    img.getAttribute("align")
      ? "(max-width: 608px) 50vw, 187px"
      : "(max-width: 608px) 100vw, 608px"
  );
}

const dimImages = async (rawContent, outputPath) => {
  let content = rawContent;

  if (outputPath && outputPath.endsWith(".html")) {
    const dom = new JSDOM(content);
    const images = [...dom.window.document.querySelectorAll("img,amp-img")];

    if (images.length > 0) {
      await Promise.all(images.map((i) => processImage(i, outputPath)));
      content = dom.serialize();
    }
  }

  return content;
};

module.exports = {
  initArguments: {},
  configFunction: async (eleventyConfig, pluginOptions = {}) => {
    eleventyConfig.addTransform("imgDim", dimImages);
  },
};
