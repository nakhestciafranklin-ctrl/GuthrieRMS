# Guthrie RMS 2.0 (BriskTable test copy)

A separate copy of the RMS for trying out the BriskTable POS. The live RMS in the site root is not changed.

Open it at `<your GitHub Pages site>/rms-2.0/` (same PINs as the live RMS).

## How it stays separate from the live RMS
- Saves in the browser under `guthrieRMS2` (the live RMS uses `guthrieRMS7A`).
- Syncs to its own Firestore document, `guthrieRMS2/sharedState` (the live RMS uses `guthrieRMS/sharedState`).
- The first time 2.0 connects, it reads the live data once to start from the real menu, inventory and staff. It never writes to the live data.
- The "Reset Local App Data" button in 2.0 clears only the 2.0 copy.
- If the Firestore rules don't allow the `guthrieRMS2` collection, 2.0 runs in local-only mode on each device. The login screen shows which mode it's in.

## BriskTable screen
Managers get a **BriskTable** tab. It has:
- The BriskTable POS link (editable), opened in a new tab or shown inside the RMS if BriskTable allows it.
- Downloads for BriskTable: Menu CSV (name, category, menu, price, modifiers), Modifiers CSV, Inventory CSV, Tables CSV, Staff CSV (names, roles and positions only, never PINs or student IDs), Catering CSV, and everything as one JSON file.
- Copy Menu, which copies a tab-separated list for pasting into a spreadsheet or form.
