const sizeOf = require("image-size");
const fs = require("fs");
const { doms, INDEX, ABOUT, CONTACT } = require("./dom-check.js");
const { execPath } = require("process");
const { type } = require("os");
//const { execPath } = require("process");

const convertDocIndexToName = index =>
  index === INDEX
    ? "main"
    : index === ABOUT
    ? "about"
    : index === CONTACT
    ? "contact"
    : "unknown";

const docs = doms.map(dom => dom.window.document);

// add a name to each document for test.each()
const docsAndNames = docs.map((doc, i) => {
  return { doc: doc, name: convertDocIndexToName(i) };
});

//load CSS file once
const css = fs.readFileSync("styles/main.css", "utf-8");

//  generating image info
const images = [];

// build the image array used by image tests
let imgs = [];
docs.forEach((doc, i) => {
  const docImages = Array.from(doc.querySelectorAll("img"));
  const docImagesIndex = docImages.map(img => {
    return { image: img, index: i };
  });
  imgs = imgs.concat(docImagesIndex);
});

// don't check dimensions on SVG images or image filenames containing "hero"
const hero = new RegExp(/hero/);
const svg = new RegExp(/svg$/);

imgs.forEach(img => {
  //clean paths
  let hotlink = false;
  if (img.image.src.startsWith("http")) {
    hotlink = true;
  }
  let path = "";
  let dimensions = 0;

  if (!hotlink) {
    path = img.image.src.replace(/^..\//, "");
    dimensions = sizeOf(path);
  }

  // get image dimensions

  images.push({
    img: img.image,
    dimensions: dimensions,
    path: path,
    checkDimensions: !hero.test(path) && !svg.test(path),
    file: convertDocIndexToName(img.index),
    hotlink: hotlink,
  });
});

// tests start here
describe("\nGeneral HTML structure\n-----------------------", () => {
  describe("REQUIRED <head> INFO", () => {
    test.each(docsAndNames)(
      "$name index.html has <title>, <meta> description and favicon info",
      ({ doc, name }) => {
        expect(
          doc.querySelector("title"),
          `${name} index.html is missing <title>`
        ).not.toBeNull();
        expect(
          doc.querySelector("meta[name=description]"),
          `${name} index.html is missing <meta> description tag`
        ).not.toBeNull();
        expect(
          doc.querySelector("link[rel='shortcut icon']"),
          `${name} index.html is missing link to favicon`
        ).not.toBeNull();
      }
    );
  });

  describe("STYLESHEETS LOADED", () => {
    const normalizeRegex = new RegExp(/normalize\..*css/);
    const fontRegex = new RegExp(/fonts.googleapis.com/);

    test.each(docsAndNames)(
      "$name index.html loads normalize, fonts, and main styles in proper order",
      ({ doc, name }) => {
        const stylesheets = doc.querySelectorAll("link[rel='stylesheet']");

        expect(
          normalizeRegex.test(stylesheets[0].href),
          `${name} index.html: normalize.css not loaded or not the first stylesheet`
        ).toBe(true);

        expect(
          fontRegex.test(stylesheets[1].href),
          `${name} index.html: Google fonts not loaded or not loaded after normalize.css`
        ).toBe(true);

        let mainFound = false;
        const lastStylesheet = stylesheets[stylesheets.length - 1];
        if (name === "main") {
          if (lastStylesheet && lastStylesheet.href === "styles/main.css") {
            mainFound = true;
          }
        } else {
          if (lastStylesheet && lastStylesheet.href === "../styles/main.css") {
            mainFound = true;
          }
        }
        expect(
          mainFound,
          `main.css not loaded in ${name} index.html or not loaded last`
        ).toBe(true);
      }
    );
  });

  describe("ONLY ONE <h1> IN AN HTML FILE", () => {
    test.each(docsAndNames)(
      "$name index.html contains exactly one <h1>",
      ({ doc, name }) => {
        const h1Count = doc.querySelectorAll("h1").length;
        expect(h1Count, `${name} index.html has ${h1Count} <h1>`).toBe(1);
      }
    );
  });

  describe("MAIN MENU", () => {
    test.each(docsAndNames)(
      "$name index.html has a <header> containing a <nav> and a <ul>",
      ({ doc, name }) => {
        expect(
          doc.querySelector("header"),
          `${name} index.html missing <header>`
        ).not.toBeNull();
        expect(
          doc.querySelector("header>nav"),
          `${name} index.html does not have a <nav> inside <header>`
        ).not.toBeNull();
        expect(
          doc.querySelector("header>nav>ul"),
          `${name} index.html does not have a <ul> in a <nav> in <header>`
        ).not.toBeNull();
      }
    );
  });
});

describe("\nImage tests\n-----------------------", () => {
  test("image paths are all lowercase and contain no spaces", () => {
    // no uppercase or whitespace
    const noUpper = new RegExp(/[A-Z]|\s/);

    images.forEach(img => {
      expect(
        noUpper.test(img.path),
        `image path "${img.path}" in ${img.file} index.html should be lowercase with no spaces`
      ).toBe(false);
    });
  });

  // TODO: check <picture> source images
  test("images must be 2000px wide or less", () =>
    images.forEach(img =>
      expect(
        img.dimensions.width,
        `image width of ${img.dimensions.width} in ${img.file} index.html too wide`
      ).toBeLessThanOrEqual(2000)
    ));

  test("relative paths to images used, and images must be in the images directory", () => {
    const regex = new RegExp(/^images\//);
    images.forEach(image => {
      expect(
        regex.test(image.path),
        `image path ${image.path} in ${image.file} index.html should relative path`
      ).toBe(true);
    });
  });

  test("non-SVG and non-<picture> images have the <img> height and width attributes set to the image's intrinsic dimensions", () => {
    let dimOK = true;
    let issues = [];
    images.forEach(image => {
      if (image.checkDimensions) {
        if (image.dimensions.width !== image.img.width) {
          dimOK = false;
          issues.push(
            `${image.file} index.html:"${image.path}" <img> width attribute of ${image.img.width} needs to be set to image intrinsic width of ${image.dimensions.width}`
          );
        }
        if (image.dimensions.height !== image.img.height) {
          dimOK = false;
          issues.push(
            `${image.file} index.html: "${image.path}" <img> height attribute of ${image.img.height} needs to be set to image intrinsic height of ${image.dimensions.height}`
          );
        }
      }
    });
    expect(dimOK, `- ${issues.join("\n- ")}`).toBe(true);
  });

  test("<picture> element must contain three <source> elements with media and srcset attributes", () => {
    const sources = docs[INDEX].querySelectorAll("picture > source");
    expect(sources.length).toBeGreaterThanOrEqual(3);
    sources.forEach(source => {
      expect(source.getAttribute("media")).not.toBeNull();
      expect(source.getAttribute("srcset")).not.toBeNull();
    });
  });

  test("contact page loads an SVG file with <img>", () =>
    expect(docs[CONTACT].querySelector("img[src$='.svg']")).not.toBeNull());
});

describe("\nMain index.html\n-----------------------", () => {
  test("main index.html must contain a <picture>, one <main>, at least two <article>, an <aside>, and a <footer>", () => {
    expect(
      docs[INDEX].querySelector("picture"),
      "<picture> not found"
    ).not.toBeNull();

    expect(
      docs[INDEX].querySelector("main"),
      "<main> not found"
    ).not.toBeNull();

    const articleNum = docs[INDEX].querySelectorAll("article").length;
    expect(
      articleNum,
      `found ${articleNum} <article> elements when expected at least two`
    ).toBeGreaterThanOrEqual(2);

    expect(
      docs[INDEX].querySelector("aside"),
      "no <aside> found"
    ).not.toBeNull();

    expect(
      docs[INDEX].querySelector("footer"),
      "no <footer> found"
    ).not.toBeNull();
  });

  test('<article> must contain an <h2>, at least one <p> and an <a class="button">', () => {
    const articles = docs[INDEX].querySelectorAll("article");
    articles.forEach((article, i) => {
      expect(
        article.querySelector("h2"),
        `<article> number ${i + 1} missing an <h2>`
      ).not.toBeNull();
      expect(
        article.querySelectorAll("p"),
        `<article> number ${i + 1} missing a <p>`
      ).not.toBeNull();
      expect(
        article.querySelector("a.button"),
        `<article> number ${i + 1} does not have an <a class="button">`
      ).not.toBeNull();
    });
  });

  test("two articles with class panel", () => {
    const panels = docs[INDEX].querySelectorAll("article.panel");
    expect(panels.length).toBeGreaterThanOrEqual(2);
  });

  test("left class used once inside both panel articles", () => {
    const panels = docs[INDEX].querySelectorAll("article.panel");

    panels.forEach(panel => {
      const lefts = panel.querySelectorAll(".left");
      expect(lefts.length).toBe(1);
    });
  });
});

describe("\nCSS tests\n-----------------------", () => {
  test("global box-sizing rule set to border-box and :root contains CSS variables", () => {
    let regex = new RegExp(/\*\s+\{\s*\n\s+box-sizing:\s+border-box/);
    expect(regex.test(css)).toBe(true);
    regex = new RegExp(/:root\s+\{\s*\n\s+--/);
    expect(regex.test(css)).toBe(true);
  });

  test("font-family, color, and line-height set in body", () => {
    const attr = ["font-family", "color", "line-height"];
    let fail = false;

    attr.forEach(a => {
      const regexStr = `body\\s+{[^}]+${a}:`;
      const regex = new RegExp(regexStr);
      if (!regex.test(css)) {
        fail = true;
      }
    });

    expect(fail).toBe(false);
  });

  test("remove underlines from <a> and add :hover class for all <a> that contain href attribute", () => {
    let regex = new RegExp(/^a\s[^}]+text-decoration:\s+none/, "gm");
    expect(regex.test(css)).toBe(true);
    regex = new RegExp(/^a\[href\]:hover\s+{$/, "gm");
    expect(regex.test(css)).toBe(true);
  });

  test("CSS contains .button style and .button:hover declarations", () => {
    let regex = new RegExp(/\.button\s*\{.*/);
    expect(regex.test(css)).toBe(true);
    regex = new RegExp(/\.button:hover\s*\{.*/);
    expect(regex.test(css)).toBe(true);
  });

  // visual tests (not tested here): overlay working; filter or background color
  test("hero section contains an <h1> and a <p>", () => {
    const hero = docs[INDEX].querySelector(".hero");
    expect(hero.querySelector("h1")).not.toBeNull();
    expect(hero.querySelector("p")).not.toBeNull();
  });

  test("hero h1 font-size set using clamp()", () => {
    const regex = new RegExp(/\.hero h1\s*\{[^}]+font-size:\s*clamp\(/);
    expect(regex.test(css)).toBe(true);
  });

  test("section with class .cards contains four cards, each with class .card", () => {
    const cards = docs[INDEX].querySelectorAll("section.cards .card");
    expect(cards.length).toBe(4);
  });
  test("css contains at least two media queries which use (min-width: ...)", () => {
    const count = (css.match(/@media\s*\(min-width/g) || []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("body set to display: flex and flex-direction: column", () => {
    const attr = ["display:\\s+flex", "flex-direction:\\s+column"];
    let fail = false;

    attr.forEach(a => {
      const regexStr = `body\\s*{[^}]+${a}`;
      const regex = new RegExp(regexStr, "gm");
      if (!regex.test(css)) {
        fail = true;
      }
    });

    expect(fail).toBe(false);
  });

  test("main has max-width set", () => {
    const regex = new RegExp(/main\s*{[^}]+max-width\s*:/, "gm");
    expect(regex.test(css)).toBe(true);
  });
});

/******************
 **   new tests  **
 ******************/

describe("\nContact page specific tests\n-----------------------", () => {
  test("contact page contains a form", () => {
    const form = docs[CONTACT].querySelector("form");
    expect(form).not.toBeNull();
  });

  test("form contains a text input and an email input", () => {
    const form = docs[CONTACT].querySelector("form");
    expect(
      form.querySelector("input[type=text]"),
      "input[type=text] not found"
    ).not.toBeNull();
    expect(
      form.querySelector("input[type=email]"),
      "input[type=email] not found"
    ).not.toBeNull();
  });

  test("email input set as a required field", () => {
    const form = docs[CONTACT].querySelector("form");
    expect(form.querySelector("input[type=email]").required).toBe(true);
  });

  test("checkboxes and radio buttons are contained in a fieldset with a legend", () => {
    const fieldsets =
      docs[CONTACT].querySelector("form").querySelectorAll("fieldset");
    expect(fieldsets, "no fieldsets found").not.toBeNull();

    fieldsets.forEach((fieldset, i) => {
      expect(
        fieldset.querySelector("legend"),
        `fieldset ${i + 1} does not have a legend`
      ).not.toBeNull();
    });
  });

  test("all checkbox inputs have the same name attribute and have a value attribute set", () => {
    const checks = docs[CONTACT].querySelector("form").querySelectorAll(
      "fieldset input[type=checkbox]"
    );
    expect(checks, "no checkboxes found").not.toBeNull();
    const name = checks[0].getAttribute("name");
    let failName = false;
    let failValue = false;
    checks.forEach(check => {
      if (check.getAttribute("name") !== name) {
        failName = true;
      }
      if (check.getAttribute("value") === null) {
        failValue = true;
      }
    });
    expect(failName, "name attributes are not the same").toBe(false);
    expect(failValue, "not all checkboxes have a value attribute").toBe(false);
  });

  test("all radio button inputs have the same name attribute and have a value attribute set", () => {
    const radios = docs[CONTACT].querySelector("form").querySelectorAll(
      "fieldset input[type=radio]"
    );
    expect(radios, "no radio buttons found").not.toBeNull();
    const name = radios[0].name;
    let fail = false;
    radios.forEach(radio => {
      if (radio.name !== name) {
        fail = true;
      }
      expect(fail).toBe(false);
    });
  });

  test("form contains a textarea and a submit <button>", () => {
    const form = docs[CONTACT].querySelector("form");
    expect(
      form.querySelector("textarea"),
      "form does not contain a <textarea>"
    ).not.toBeNull();
    expect(
      form.querySelector("button"),
      "form does not contain a <button>"
    ).not.toBeNull();
  });

  test("textarea contains a placeholder", () => {
    const form = docs[CONTACT].querySelector("form");
    expect(
      form.querySelector("textarea").getAttribute("placeholder")
    ).not.toBeNull();
  });

  test("all form <input> elements must have type, id and name attributes", () => {
    const inputs =
      docs[CONTACT].querySelector("form").querySelectorAll("input");

    let fail = false;
    let problems = [];
    inputs.forEach(element => {
      const type = element.getAttribute("type");
      const id = element.getAttribute("id");
      const name = element.getAttribute("name");
      if (type === null || id === null || name === null) {
        fail = true;

        const input = id
          ? id
          : name
          ? name
          : type
          ? type
          : "{no id, name or type}";
        problems.push(input);
      }
    });
    expect(
      fail,
      `inputs with issues [id|name|type] ${problems.join(", ")}`
    ).toBe(false);
  });

  test("explicit label used with a for attribute linking it to a form element", () => {
    const labels =
      docs[CONTACT].querySelector("form").querySelectorAll("label");
    const problems = [];
    expect(labels, "no labels found").not.toBeNull();
    labels.forEach(label => {
      //check that label is not implicit
      if (label.firstElementChild) {
        problems.push(
          `${label.textContent}: contains an element - use explicit label`
        );
      }
      // check that label has a for attribute
      if (!label.getAttribute("for")) {
        problems.push(`${label.textContent} missing for attribute`);
      } else {
        // check that label for attribute matches an id
        const id = label.getAttribute("for");

        if (!docs[CONTACT].querySelector(`#${id}`)) {
          problems.push(
            `${label.textContent}: "for=${id}" does not match an id on the page`
          );
        }
      }
    });
    expect(problems.length, `labels with issues:\n${problems.join("\n")}`).toBe(
      0
    );
  });
});
