# 🏰 Pixel Kingdom Organizational Chart

A beautiful, interactive organizational chart with a retro pixel art kingdom theme that pulls data from Google Sheets.

![Kingdom Org Chart](https://img.shields.io/badge/Status-Ready-brightgreen?style=for-the-badge)
![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=for-the-badge)

## ✨ Features

- 🎮 **Retro Pixel Art Design** - Beautiful kingdom-themed interface with animations
- 📊 **Google Sheets Integration** - Automatically pulls data from your spreadsheet
- 🔄 **Real-time Updates** - Refresh data with a single click
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- ⚡ **Interactive** - Expand/collapse nodes to explore the hierarchy
- 🎨 **Color-coded Roles** - Different colors for different positions
- 🌐 **GitHub Pages Ready** - Easy deployment

## 🚀 Quick Start

### Option 1: Use Demo Data (Instant Preview)

1. Open `index.html` in your browser
2. The chart will automatically load with demo data
3. Explore the interface and features

### Option 2: Connect to Google Sheets

#### Step 1: Prepare Your Google Sheet

1. Create a new Google Sheet with the following columns:
   ```
   Name | Title | Department | Manager
   ```

2. Fill in your organization data. Example:
   ```
   Name        | Title              | Department  | Manager
   ------------|--------------------|--------------|---------
   Catherine   | CEO                |             |
   Pauline     | COO                |             | Catherine
   Janine      | Admin Head         | Admin       | Pauline
   Angela      | Operations Manager | Admin       | Janine
   ```

3. **Important Column Descriptions:**
   - **Name**: Employee's name (unique identifier)
   - **Title**: Job title or role
   - **Department**: Department name (Admin, Marketing, Production, Warehouse, etc.)
   - **Manager**: Name of the person they report to (must match a Name exactly)

#### Step 2: Publish Your Sheet

1. In Google Sheets, go to **File → Share → Publish to web**
2. Choose **Entire Document** or your specific sheet
3. Select **Comma-separated values (.csv)** as the format
4. Click **Publish**
5. Copy the published URL (it should look like this):
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```

#### Step 3: Configure the App

1. Open `script.js` in a text editor
2. Find the `CONFIG` object at the top (around line 2)
3. Replace `YOUR_GOOGLE_SHEET_CSV_URL` with your published sheet URL:
   ```javascript
   const CONFIG = {
       SHEET_URL: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0',
       // ... rest of config
   };
   ```
4. Save the file

#### Step 4: Test Locally

1. Open `index.html` in your browser
2. Click the "🔄 Refresh Data" button
3. Your organizational chart should appear!

## 🌐 Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `org-chart` or `kingdom-org-chart`
3. Make it **Public** (required for GitHub Pages)
4. Don't initialize with README (we already have files)

### Step 2: Initialize Git and Push

Open terminal in the "Claude Sandbox" folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Pixel Kingdom Org Chart"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select **main** branch
4. Click **Save**
5. Wait a few minutes for deployment

Your site will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## 🎨 Customization

### Change Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --pixel-primary: #8b4513;    /* Main brown color */
    --pixel-secondary: #d2691e;   /* Secondary brown */
    --pixel-accent: #ffd700;      /* Gold accent */
    --pixel-bg: #87ceeb;          /* Sky blue background */
    /* ... more colors */
}
```

### Add Custom Icons

Edit the `ROLE_ICONS` object in `script.js`:

```javascript
ROLE_ICONS: {
    'CEO': '👑',
    'Manager': '⭐',
    'Developer': '💻',
    'Designer': '🎨',
    // Add your own!
}
```

### Modify Role Colors

Different roles get different background colors. Edit the CSS classes in `styles.css`:

```css
.node.ceo {
    background: linear-gradient(135deg, #ffb6c1 0%, #ffc0cb 100%);
    border-color: #ff1493;
}
```

## 📋 Google Sheets Template

Here's a template you can copy:

| Name | Title | Department | Manager |
|------|-------|-----------|---------|
| Catherine | CEO | | |
| Pauline | COO | | Catherine |
| Janine | Admin Head | Admin | Pauline |
| Angela | Operations Manager | Admin | Janine |
| Jeanne | Marketing Head | Marketing | Pauline |
| Kriselle | Marketing Manager | Marketing | Jeanne |

**Tips:**
- The "Manager" column must exactly match someone's "Name"
- Leave "Manager" empty for top-level executives (like CEO)
- You can add as many levels as you want
- Department names affect the node colors

## 🔧 Troubleshooting

### Chart Not Loading?

1. Check browser console (F12) for errors
2. Verify your Google Sheet is published to web
3. Make sure the CSV URL is correctly configured in `script.js`
4. Ensure your sheet has the correct column headers

### Data Not Updating?

1. Click the "🔄 Refresh Data" button
2. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
3. Check if your Google Sheet is still published
4. Wait a few minutes - Google Sheets can cache data

### Hierarchy Not Showing Correctly?

1. Verify the "Manager" column exactly matches employee names
2. Check for typos in names
3. Make sure there are no circular references (A reports to B, B reports to A)
4. Verify there's at least one person with no manager (root node)

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (not supported)

## 🎯 Features Roadmap

- [ ] Export chart as image
- [ ] Search functionality
- [ ] Dark mode toggle
- [ ] Custom themes
- [ ] Print-friendly view
- [ ] Employee photos
- [ ] Multiple org chart views

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📄 License

Free to use and modify. Built with ❤️ using vanilla JavaScript.

## 🎮 Credits

- Pixel art design inspired by retro kingdom games
- Built with pure HTML, CSS, and JavaScript
- No external dependencies required

---

**Enjoy your Pixel Kingdom Organizational Chart! 🏰**

For questions or issues, check the troubleshooting section above.
