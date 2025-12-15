# Google Sheets Template for Pixel Kingdom Org Chart

## Required Columns

Your Google Sheet must have these exact column headers:

| Name | Title | Department | Manager |
|------|-------|-----------|---------|

## Column Descriptions

### Name (Required)
- The employee's full name
- **Must be unique** - this is used as the identifier
- Will be displayed on the org chart card
- Example: `Catherine`, `Pauline`, `Janine`

### Title (Required)
- The employee's job title or role
- Will be displayed below the name
- Used to determine the icon and color
- Examples: `CEO`, `Marketing Manager`, `Developer`, `Designer`

### Department (Optional)
- The department the employee belongs to
- Used to color-code the org chart nodes
- Common values: `Admin`, `Marketing`, `Production`, `Warehouse`
- Leave blank for executives (CEO, COO)

### Manager (Required for non-executives)
- The name of the person this employee reports to
- **Must exactly match** another employee's Name
- Leave blank for top-level executives (CEO, etc.)
- Example: If `Pauline` reports to `Catherine`, put `Catherine` in Pauline's Manager column

## Sample Data

Here's sample data based on your org chart image:

```
Name           | Title                    | Department  | Manager
---------------|--------------------------|-------------|----------
Catherine      | CEO                      |             |
Pauline        | COO                      |             | Catherine
Janine         | Admin Head               | Admin       | Pauline
Angela         | Operations Manager       | Admin       | Janine
Con            | Office Manager           | Admin       | Janine
Jeanne         | Marketing Head           | Marketing   | Pauline
Kriselle       | Marketing Manager        | Marketing   | Jeanne
Kez            | Social Media Lead        | Marketing   | Kriselle
Edgar          | Content Creator          | Marketing   | Kriselle
Franz          | Designer                 | Marketing   | Kriselle
Kei            | Ads Specialist           | Marketing   | Kriselle
Gjay           | Ads Team Lead            | Marketing   | Pauline
Olivet         | Ads Manager              | Marketing   | Gjay
Sharry         | Production Head          | Production  | Pauline
Micah          | Production Manager       | Production  | Sharry
Bea            | Production Staff         | Production  | Sharry
Lei            | Production Staff         | Production  | Sharry
Frank          | Production Staff         | Production  | Micah
Nhu            | Production Staff         | Production  | Micah
Leah           | Production Staff         | Production  | Micah
Hoa            | Production Staff         | Production  | Micah
Roman          | Production Staff         | Production  | Micah
Phuong         | Production Supervisor    | Production  | Micah
Nguyen Lee     | Production Staff         | Production  | Phuong
Tuyet          | Production Staff         | Production  | Phuong
Thi Hue        | Production Staff         | Production  | Phuong
Yen Linh       | Production Staff         | Production  | Phuong
Thi Cong       | Production Staff         | Production  | Phuong
Thi Hue        | Production Staff         | Production  | Phuong
Ngan           | Production Staff         | Production  | Phuong
Truc Tho       | Production Staff         | Production  | Phuong
Thu Ni         | Production Staff         | Production  | Phuong
Thi Trang      | Production Staff         | Production  | Phuong
Ryan           | US Warehouse Manager     | Warehouse   | Pauline
Michael        | Warehouse Staff          | Warehouse   | Ryan
Dean           | Warehouse Staff          | Warehouse   | Ryan
Claude         | Warehouse Staff          | Warehouse   | Ryan
Robert         | China Warehouse Manager  | Warehouse   | Pauline
Mary           | Warehouse Staff          | Warehouse   | Robert
```

## How to Create Your Sheet

### Method 1: Create from Scratch

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Company Org Chart" (or whatever you prefer)
4. In row 1, add the headers: `Name`, `Title`, `Department`, `Manager`
5. Fill in your organization data starting from row 2
6. Follow the formatting guidelines above

### Method 2: Import CSV

1. Copy the sample data above
2. Save it as a CSV file
3. Go to Google Sheets
4. File → Import → Upload → Select your CSV
5. Choose "Replace spreadsheet" or "Insert new sheet"

## Publishing Your Sheet

1. In your Google Sheet, go to **File → Share → Publish to web**
2. In the dialog:
   - Choose **Entire Document** (or select your specific sheet)
   - Select format: **Comma-separated values (.csv)**
   - Click **Publish**
3. Copy the published URL
4. It should look like this:
   ```
   https://docs.google.com/spreadsheets/d/LONG_SHEET_ID/export?format=csv&gid=0
   ```
5. Paste this URL into `script.js` (replace `YOUR_GOOGLE_SHEET_CSV_URL`)

## Important Notes

### ✅ Do's:
- Keep column headers exactly as specified (case-sensitive)
- Make sure Name values are unique
- Ensure Manager values exactly match Name values
- Use consistent spelling and capitalization
- Test with a small dataset first

### ❌ Don'ts:
- Don't add extra spaces in names or titles
- Don't create circular references (A reports to B, B reports to A)
- Don't leave Name column empty
- Don't use special characters that might break CSV format
- Don't forget to publish the sheet to web

## Common Issues

### "Manager not found" errors
- Make sure the Manager name exactly matches someone's Name
- Check for extra spaces or typos
- Names are case-sensitive

### Missing employees
- Check if they have a Name value
- Verify the row isn't hidden
- Make sure the data is in the published sheet

### Hierarchy looks wrong
- Review the Manager relationships
- Ensure there's only one top-level person (no manager)
- Check for circular references

## Privacy Considerations

⚠️ **Important**: Publishing your sheet to the web makes it **publicly accessible** to anyone with the link.

**Recommendations**:
- Only include information you're comfortable making public
- Don't include personal data (phone numbers, addresses, salaries)
- Consider using titles instead of full names if needed
- Regularly review who has access
- You can unpublish anytime from the same menu

## Updating the Chart

The chart automatically fetches data from your published sheet:
1. Update your Google Sheet
2. Wait 1-2 minutes for Google's cache to update
3. Click "🔄 Refresh Data" on the org chart
4. Changes should appear immediately

## Advanced Tips

### Add New Departments
Just use a new department name - the chart will automatically assign colors

### Reorganize Teams
Simply change the Manager values - the hierarchy updates automatically

### Remove Someone
Delete their row, or leave the sheet but set their Manager to empty

### Multiple Reporting Lines
Currently not supported - each person can only have one manager

---

**Ready to use your data?**
1. Create your sheet
2. Publish it
3. Copy the URL
4. Configure `script.js`
5. Refresh the page!
