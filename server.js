require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
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

function createMailerTransport() {
  const mailerUser = process.env.EMAIL_USER;
  const mailerPass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT);
  const secure = process.env.EMAIL_SECURE === 'true';

  if (host) {
    return nodemailer.createTransport({
      host,
      port: Number.isInteger(port) ? port : 587,
      secure,
      auth: {
        user: mailerUser,
        pass: mailerPass,
      },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailerUser,
      pass: mailerPass,
    },
  });
}

function getMailErrorMessage(error) {
  const message = error?.message || '';
  if (error?.code === 'EAUTH' || /invalid login|bad credentials|authentication/i.test(message)) {
    return 'Gmail authentication failed. If you use Gmail, enable 2-Step Verification and set EMAIL_PASS to a Google App Password.';
  }
  return 'Unable to send your enquiry right now. Please try again later.';
}

app.get('/', (req, res) => {
  const siteData = loadSiteData();
  res.render('index', {
    data: siteData,
    contactFeedback: req.query.contactFeedback || null,
    contactFeedbackType: req.query.contactFeedbackType || null
  });
});

app.post('/contact', async (req, res) => {
  const { name, designation, schoolName, message } = req.body;
  const mailerUser = process.env.EMAIL_USER;
  const mailerPass = process.env.EMAIL_PASS;
  const wantsJson = req.xhr || req.get('X-Requested-With') === 'XMLHttpRequest' || req.accepts(['html', 'json']) === 'json';
  if (!mailerUser || !mailerPass) {
    const errorMessage = 'Mail settings are not configured on the server.';
    if (wantsJson) {
      return res.status(500).json({ success: false, message: errorMessage });
    }
    return res.redirect('/?contactFeedback=' + encodeURIComponent(errorMessage) + '&contactFeedbackType=error');
  }
  const transporter = createMailerTransport();
  const mailOptions = {
    from: `${name || 'Website Contact'} <${mailerUser}>`,
    to: process.env.EMAIL_TO || 'foundation2futureaep@gmail.com',
    subject: 'New contact form submission from website',
    html: `
      <p>A new contact inquiry was submitted from the website.</p>
      <p><strong>Name:</strong> ${name || 'N/A'}</p>
      <p><strong>Designation:</strong> ${designation || 'N/A'}</p>
      <p><strong>School Name:</strong> ${schoolName || 'N/A'}</p>
      <p><strong>Message:</strong><br/>${message || 'N/A'}</p>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    const successMessage = 'Your enquiry was sent successfully. We will contact you soon.';
    if (wantsJson) {
      return res.json({ success: true, message: successMessage });
    }
    res.redirect('/?contactFeedback=' + encodeURIComponent(successMessage) + '&contactFeedbackType=success');
  } catch (error) {
    console.error('Contact form mail error:', error);
    const feedbackMessage = getMailErrorMessage(error);
    if (wantsJson) {
      return res.status(500).json({ success: false, message: feedbackMessage });
    }
    res.redirect('/?contactFeedback=' + encodeURIComponent(feedbackMessage) + '&contactFeedbackType=error');
  }
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
