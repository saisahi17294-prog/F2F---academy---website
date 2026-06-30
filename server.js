const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const publicDir = path.join(__dirname, 'public');

app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

function loadSiteData() {
  const dataPath = path.join(__dirname, 'data', 'siteData.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function saveSiteData(data) {
  const dataPath = path.join(__dirname, 'data', 'siteData.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/', (req, res) => {
  const siteData = loadSiteData();
  res.render('index', { data: siteData });
});

app.get('/admin', (req, res) => {
  const siteData = loadSiteData();
  res.render('admin', {
    siteData,
    message: req.query.message || null,
    error: req.query.error || null,
  });
});

app.post('/admin', (req, res) => {
  const siteData = loadSiteData();
  if (req.body.site) {
    siteData.site = { ...siteData.site, ...req.body.site };
  }
  if (req.body.hero) {
    siteData.hero = { ...siteData.hero, ...req.body.hero };
  }
  if (req.body.partnership) {
    siteData.partnership = { ...siteData.partnership, ...req.body.partnership };
  }
  if (req.body.programmes) {
    siteData.programmes = { ...siteData.programmes, ...req.body.programmes };
  }
  if (req.body.nav) {
    const navInput = req.body.nav;
    const navArray = Array.isArray(navInput)
      ? navInput
      : Object.keys(navInput)
          .sort((a, b) => Number(a) - Number(b))
          .map((key) => navInput[key]);
    if (navArray.length) {
      siteData.nav = siteData.nav.map((item, index) => ({
        id: item.id,
        label: navArray[index]?.label || item.label,
      }));
    }
  }
  saveSiteData(siteData);
  res.redirect('/admin?message=' + encodeURIComponent('Content saved successfully.'));
});

app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`Foundation To Future Academy site running on http://localhost:${PORT}`);
});
