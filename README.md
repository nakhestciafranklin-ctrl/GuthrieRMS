# Guthrie RMS

GitHub Pages-ready repository for the Guthrie Restaurant Management System.

## Live Website Files
The files GitHub Pages needs are intentionally stored in the repository root:

- `index.html`
- `app.js`
- `styles.css`

Do not move these three files into another folder unless the GitHub Pages publishing settings are changed too.

## GitHub Pages Setup
After uploading this repository to GitHub:

1. Open the repository.
2. Select **Settings**.
3. Select **Pages** in the left menu.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
5. Set **Branch** to `main`.
6. Set the folder to `/ (root)`.
7. Click **Save**.
8. GitHub will build the site. Refresh the Pages settings screen after a minute or two to see the live website URL.

The live RMS will launch from the root `index.html` file.

## Updating the live RMS
For future approved updates, replace or edit the root `index.html`, `app.js`, and `styles.css`, then commit the changes to `main`. GitHub Pages will publish the new version automatically.

## Recommended workflow
Keep `main` as the stable/live version. For major changes, create a branch first, test it, then merge into `main` when approved.


## Shift Scheduling Update
- Manager Shift Scheduler
- Choose the operation being staffed
- Schedule date, start/end time, location, status and notes
- Assign students to the shift
- Assign a position to each scheduled student
- Publish, duplicate, edit and delete shifts
- Student interface shows My Schedule
- Teacher interface shows schedules for assigned students
- Scheduling operations can be edited from Settings
- Export schedule to CSV


## Theme & Appearance Settings
Managers can now customize the website without editing code. Settings include primary color, accent color, header color, page background, card/surface color, text color, font family, card radius, button radius, and background style. A live preview and reset-to-Guthrie-default option are included.


## Logo Fix
The official Guthrie Center logo is included locally at `assets/guthrie-center-logo.jpg` and is used on the login screen and top navigation. This removes the broken external/missing image reference.

## Latest Operational Update
Inventory items can now be added, edited, deleted, re-counted, and reassigned to storage locations directly in the site. Walk-In Fridge and Walk-In Freezer are standard inventory locations. Catering Guest Count has been reformatted as a distinct field. The student position list now includes the Guthrie Enterprise leadership ladder and operational roles used for shift assignment and workforce-progress tracking.

## User Management Update
- Manager Settings now includes explicit Edit and Delete actions for students and teachers.
- Teachers can add students directly from Student Development.
- Teachers can edit and delete students assigned to them.
- Teachers cannot modify students assigned to another teacher.
- Student ID remains the student login PIN when edited.
- Deleting a student removes future schedule assignments but preserves historical shift/evaluation records for reporting.
- Deleting a teacher leaves their assigned students unassigned so a manager can reassign them.

## Tablet Camera Barcode Inventory
- Scan UPC/EAN and common barcodes from the tablet camera on supported browsers.
- Barcode is stored on the inventory item for future lookup.
- Known barcode: opens quantity controls immediately.
- Unknown barcode: opens an add-new-inventory-item form.
- Quantity can be added, subtracted, or set to an exact count.
- Bluetooth barcode scanners and manual barcode entry remain supported.
- Camera access requires the HTTPS GitHub Pages site and browser camera permission.


## iPad / Safari Barcode Scanning
- Rear-camera barcode scanner optimized for Apple iPad Safari.
- Uses a Safari-compatible HTML5 barcode decoder when Apple's browser does not provide the BarcodeDetector API.
- Scan workflow: Scan → Count → Save → Scan Next Item.
- Supports known-item lookup and unknown-item creation.
- Bluetooth and manual barcode entry remain available.
- GitHub Pages HTTPS is required for camera permissions.

### iPad camera permission
The first scan will ask for camera permission. Choose **Allow**. If permission was previously denied, update Safari/site camera permission in iPad Settings and reload the RMS.


## Inventory Delete Update
- Added a visible **Delete** button beside **Edit** on every Bistro and Culinary inventory row.
- Added Delete Item to the known-item barcode scan result.
- Deletion requires confirmation.
- Historical delivery/usage records are preserved and a local inventory deletion audit log is retained.


## Loading Hotfix
- Added safe migration for older browser-saved Guthrie RMS data.
- Missing database arrays are rebuilt automatically instead of crashing the page.
- Corrupted JSON is skipped and preserved in a recovery key when possible.
- Added an emergency on-page recovery message if a startup error ever leaves the app blank.
