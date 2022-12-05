<!-- cSpell:enable  -->

# Add a video

**Objectives**: Add a video to your website

**Concepts covered**: `<video>`, "better" embedding of YouTube videos

## Instructions
  I'll demo this in class. If you miss class 
  - for `<video>` view this [web page](https://lsburtonbyu.github.io/video/) (scroll down for setup instructions) and also view the HTML and CSS using Dev Tools.
  - for YouTube, view this [CodePen](https://codepen.io/lsburton/pen/wvpPxQV?editors=1000). Replace the video ID with your own.
  
| :warning: This assignment builds on your previous assignment                                                                                                                                                                                                                                                                                                                                                                               |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| After cloning this repo and opening it in VSCode, copy the following files and folders from your _Grid + Form + Style_ assignment into this repo.<br><br><ul><li>📄 index.html</li><li>📄 favicon.ico</li><li>📁styles</li><li>📁images</li><li>📁about</li><li>📁contact</li></ul><br>**Make sure that you don't copy any other folders or files, including the `test` folder, the hidden `.git` and `.github` folders, and the `package.json` files** |


## :rocket: Publish on Github Pages

When your assignment is finished, check that is doesn't have any warnings or errors in VS Code (fix them if you find any), then sync it to Github and publish it on Github Pages. Remember to paste the Github pages URL in the repo _About_ section.

| :warning: Make sure to validate your website on [validator.nu](https://validator.nu/).                                                                                                                                                                                                                                                                                                            |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| It's easier to understand validator errors on validator.nu rather than in Github report. Once your Github Pages is live, copy the URL and paste it in [validator.nu](https://validator.nu/). Check "outline" and "image report" and then select `Check`. Make sure you also validate your contact and about pages. If you have any errors, fix them before submitting your URL to Learning Suite. |

## ⬆️ Post repo URL on Learning Suite

Review the tests below and make sure your repo passes them. If you kept your website consistent with the previous assignments, you should pass all of previous tests. The new tests are listed at the end of the tests.

When you are ready for you assignment to be graded, submit a link to your Github repo on Learning Suite for the **Responsive flexboxes** assignment
<br><br><br>

### :star: Assignment tests

_Tests from previous assignments._

## General HTML structure

```
REQUIRED `<head>` INFO
- main index.html has <title>, <meta> description and favicon info
- about index.html has <title>, <meta> description and favicon info
- contact index.html has <title>, <meta> description and favicon info

STYLESHEETS LOADED
- main index.html loads normalize, fonts, and main styles in proper order
- about index.html loads normalize, fonts, and main styles in proper order
- contact index.html loads normalize, fonts, and main styles in proper order

ONLY ONE `<h1>` IN AN HTML FILE
- main index.html contains exactly one <h1>
- about index.html contains exactly one <h1>
- contact index.html contains exactly one <h1>

MAIN MENU
- main index.html has a <header> containing a <nav> and a <ul>
- about index.html has a <header> containing a <nav> and a <ul>
- contact index.html has a <header> containing a <nav> and a <ul>
```

## Main index.html

```
- main index.html must contain one <main>, at least two <article>, an <aside>, and a <footer>
- <article> must contain an <h2>, at least one <p> and an <a class="button">
- two articles with class panel
- left class used once inside both panel articles
```

## Image tests

```
- image paths are all lowercase and contain no spaces
- images must be 1920px wide or less
- relative paths to images used, and images must be in the images directory
- non-SVG and non-<picture> images have the <img> height and width attributes set to the image's intrinsic dimensions
- contact page loads an SVG file with <img>
```

## CSS tests

```
- global box-sizing rule set to border-box and :root contains CSS variables
- font-family, color, and line-height set in body
- remove underlines from <a> and add :hover class for all <a> that contain href attribute
- CSS contains .button style and .button:hover declarations
- hero section contains an <h1> and a <p>
- hero h1 font-size set using clamp()
- section with class .cards contains four cards, each with class .card
- css contains at least two media queries which use (min-width: ...)
- body set to display: flex and flex-direction: column
- main has max-width set
```

## recent tests

```
- contact page contains a form
- form contains a text input and an email input
- email input set as a required field
- checkboxes and radio buttons are contained in a fieldset with a legend
- all checkbox inputs have the same name attribute and have a value attribute set
- all radio button inputs have the same name attribute and have a value attribute set
- form contains a textarea and a submit <button>
- textarea contains a placeholder
- all form <input> elements must have type, id and name attributes
- explicit label used with a for attribute linking it to a form element
```

| :heavy_check_mark: You will also be graded on the following items from the rubric:                                                                                                                                                                                                                              |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <ul><li>a video is displayed somehwere on your website (hero image or article image, for example) following instructions given in class</li><li>The general appearance of your web page – proper spacing, font size, etc. </li></ul> |
