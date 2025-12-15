# Google Sheets Setup Guide

## Required Columns

Your Google Sheet needs these columns (in this exact order):

| Name | Title | Department | Manager | ImageURL | Details |
|------|-------|-----------|---------|----------|---------|

## Column Descriptions

### 1. Name (Required)
- Employee's full name
- **Must be unique** - used as identifier
- Example: `Catherine`, `Pauline`, `Janine`

### 2. Title (Required)
- Job title or role
- Examples: `CEO`, `OBM`, `Marketing Head`, `Designer`

### 3. Department (Optional for executives)
- Department name
- Leave blank for CEO and OBM
- Examples: `Admin`, `Marketing`, `Production`, `Warehouse`

### 4. Manager (Optional for CEO)
- Name of the person they report to
- **Must exactly match** another person's Name
- CEO should have this blank
- Example: If Pauline reports to Catherine, put `Catherine` here

### 5. ImageURL (Optional)
- **NEW COLUMN!** Link to chibi/profile image
- Can be a public URL (Google Drive, Imgur, etc.)
- Leave blank to show just the person's initial
- Examples:
  - `https://i.imgur.com/abc123.png`
  - `https://drive.google.com/uc?id=YOUR_FILE_ID`

### 6. Details (Optional)
- **NEW COLUMN!** Fun facts or bio information
- Will show in the popup when someone clicks on a person
- Can be multiple lines
- Examples:
  - `Loves coffee and strategy. Founded Moeflavor in 2020.`
  - `Anime enthusiast. Favorite show: Attack on Titan.`
  - `Runs 5 miles every morning. Speaks 3 languages.`

## Example Sheet Structure

```
Name        | Title              | Department  | Manager   | ImageURL                              | Details
------------|--------------------|--------------|-----------|-----------------------------------------|----------------------------------
Catherine   | CEO                |             |           | https://i.imgur.com/catherine.png      | Founder and visionary leader.
Pauline     | OBM                |             | Catherine | https://i.imgur.com/pauline.png        | Operations mastermind.
Janine      | Admin Head         | Admin       | Pauline   | https://i.imgur.com/janine.png         | Loves organization and systems.
Angela      | Operations Manager | Admin       | Janine    |                                        | Detail-oriented perfectionist.
Jeanne      | Marketing Head     | Marketing   | Pauline   | https://i.imgur.com/jeanne.png         | Creative marketing guru.
Kriselle    | Marketing Manager  | Marketing   | Jeanne    | https://i.imgur.com/kriselle.png       | Social media wizard.
```

## Hierarchy Structure

The org chart now works like this:

```
CEO (Catherine)
    ↓
OBM (Pauline)
    ↓
Departments (displayed as a grid)
    ↓
Department Heads
    ↓
Team Members
```

## How to Add Images

### Option 1: Use Imgur (Easiest)
1. Go to [imgur.com](https://imgur.com)
2. Upload your chibi image
3. Right-click the image → "Copy image address"
4. Paste the URL into the ImageURL column

### Option 2: Use Google Drive
1. Upload image to Google Drive
2. Right-click → Get link → Set to "Anyone with the link"
3. Copy the file ID from the URL
4. Use format: `https://drive.google.com/uc?id=YOUR_FILE_ID`

### Option 3: Host on Your Own Server
1. Upload image to your website
2. Copy the direct image URL
3. Paste into ImageURL column

**Important**: Images must be publicly accessible URLs!

## Publishing Your Sheet

1. In Google Sheets, go to **File → Share → Publish to web**
2. Choose **Entire Document** or your specific sheet
3. Select format: **Comma-separated values (.csv)**
4. Click **Publish**
5. **Copy the URL** - it should look like:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```

6. This URL is already in `script.js`, so you're good to go!

## Privacy Note

⚠️ **Your sheet will be publicly accessible!** Only include information you're comfortable sharing publicly.

**Don't include**:
- Personal phone numbers
- Home addresses
- Sensitive information
- Salaries or compensation

## Testing the Popup

To test if your image URLs and details work:

1. Open `index.html` in your browser
2. Click the "Refresh Data" button
3. Click on any person's name
4. A popup should appear with:
   - Their chibi image (or their initial if no image)
   - Their name and title
   - Their fun facts/details

## Troubleshooting

### Image Not Showing?
- Make sure the URL is publicly accessible
- Try opening the URL in an incognito browser window
- Check that the URL ends with a file extension (.png, .jpg, .gif)
- For Google Drive, make sure link sharing is set to "Anyone with the link"

### Details Not Appearing?
- Make sure you added the "Details" column
- Check that there's text in that cell
- Refresh the page after updating the sheet

### Person Not Appearing?
- Check that Name is filled in
- Verify Department spelling is consistent
- Make sure Manager name exactly matches someone else's Name

## Quick Reference

**Hierarchy Logic:**
1. CEO = Catherine (or anyone with "CEO" in title)
2. OBM = Pauline (or anyone with "OBM" or "COO" in title)
3. Departments = All unique values in Department column
4. Each department shows its team members when expanded

**Click Behavior:**
- Click department → Expands to show team
- Click person → Opens popup with details and image

---

**Need help?** Check the main README.md for more information!
