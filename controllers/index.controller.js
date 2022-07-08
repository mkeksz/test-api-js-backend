const { marked } = require('marked');
const fs = require('fs');

module.exports = {
  get,
};

function get(req, res) {
  const path = `${__dirname}/../README.md`;
  const file = fs.readFileSync(path, 'utf8');
  const pageContent = marked(file.toString());
  const htmlResult = `
    <html lang="ru">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="github-markdown.css">
        <title>README.md</title>
      </head>
      <body>
        <article class="markdown-body">${pageContent}</article>
      </body>
    </html>
  `;

  res.send(htmlResult);
}
