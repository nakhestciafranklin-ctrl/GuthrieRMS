# Guthrie RMS Changelog

## Rush-Proof Orders: Offline Safety, Order Archive Storage, Smaller Shared Data
- Orders rung up while an iPad has no Wi-Fi are kept on that iPad until the cloud confirms them, even if the iPad reloads before reconnecting. They are sent as soon as it's back online and merged field by field with anything other devices changed meanwhile (KMS taps, payment). Before, a reload before reconnecting could drop them.
- Order archive (long-term storage): paid orders from earlier days move hourly out of the shared data into one cloud archive per day (guthrieRMS/archive_YYYY-MM-DD). The shared data then holds mainly today, so it stays small and fast in a rush, and history is kept instead of cleared after 7 days. Reports (Today, Last 7 Days, This Month, All Time, Custom) include archived days. If the Firebase rules don't allow the archive, the app falls back to clearing paid orders older than 7 days and Settings › Data shows the rule to add.
- An hour after an order is paid and its ticket is done, the KMS timing details are dropped (who started/finished each item and when); sales, items, options, payment and par counts are kept. About doubles how many orders one day can hold.
- A finished ticket stays finished when devices reconnect: the ticket stage follows its combined log, so it only reopens when it was recalled or more items were sent.
- Settings › Data shows archive status, archived days, orders waiting, and "Archive Earlier Days Now".
- Load-tested (simulated shared database, 1 register + 6 KMS iPads, 60–100 orders at 1–2 a second, plus a register that loses Wi-Fi, rings up 3 orders, reloads and reconnects): no lost orders, payments or KMS taps; the offline orders reached the KMS after reconnecting; all iPads matched; chimes exact per station; earlier days archived (or cleared after 7 days when the archive is blocked).

## Easier Option (Modifier) Editing in Settings › Menu Items
- The Add / Edit item pop-up replaces the typed options box with an option editor. Each group is a card with its name, a Required / Optional switch, a Pick 1 / Pick any switch, and one row per option with a +/− $ box for an upcharge (1.00) or discount (-8). Add Option, ✕ to remove, ↑ ↓ to reorder groups, Delete Group.
- "+ Add a common group…" adds a ready-made group to edit: Hot or Iced, Ice, Flavor, Protein, Tortilla, Leave Off, Add Toppings, Warm, Allergy Alert.
- A live Preview shows the options exactly as students will see them when ringing up.

## Reliability for Busy Service (1 register + 6 KMS iPads)
- Fixed: a payment could be lost when the register marked an order paid at the same moment a KMS station tapped that order (the device that saved last replaced the whole order). Orders now merge field by field against the last shared copy: a change made on only one device is always kept, ticket lines merge by line (removed lines stay removed, added lines are kept), and the KMS log and refunds combine. A paid order stays paid.
- Load-tested with a simulated shared database, 1 register and 6 KMS iPads (Grill, Fry, Beverage, Expo, All Tickets, a second Grill) tapping Start/Complete at once: 60 orders at about 1 a second and 120 orders at about 2 a second, each sent and paid right away. Result: no lost orders, payments or KMS taps, every iPad ended up identical, and each station chimed exactly once per order sent to it.
- Paid orders older than 7 days are cleared automatically (every hour, on every device) to keep the shared data far under the cloud's 1 MB limit. Open orders are never cleared. Settings › Data shows the shared data size, sync status and a "Clear Now" button.
- A red banner shows on any iPad whose changes have not reached the cloud for more than 8 seconds (e.g. Wi-Fi down), instead of failing silently. Managers see a yellow warning if the shared data passes 75% of the limit.
- KMS: a large "Sound is off on this iPad — tap here" banner shows whenever the browser has turned sound off (after a reload or the iPad sleeping) and disappears once tapped.

## KMS Sound Plays Only at the Order's Stations
- Each KMS iPad now remembers its station (saved on that iPad). Before, every iPad went back to All Tickets when the app reloaded, so every station chimed for every order.
- A station chimes only for orders with items (or parts, like fries) sent to it. An order with tacos and a latte chimes on Grill and Beverage only. Expo and All Tickets chime for every order.
- Each station has its own tone (Grill lowest, then Fry, Salad, Beverage, Dessert), so nearby stations can tell whose order came in. The KMS shows "This iPad: Grill" next to the sound buttons, and the pop-up says which station the new ticket is for.

## Settings > Menu Items: Add, Edit, Hide and Delete Products
- New Menu Items page in Settings (managers). Pick Café Menu, Bistro Menu or Exemption Day to see its items by section, with picture, price, KMS station and status. Search box to find an item.
- + Add Item / Edit: name, price, menu, category (section), KMS station, picture (any of the menu photos, or an automatic food icon) and options.
- Options are typed one group per line, for example "Size (required, pick 1): Cup, Bowl +2". "required" must be chosen, "pick 1" allows only one, and +1 / -8 after an option adds an upcharge or discount. The order pop-up shows them as groups like the Exemption Day items.
- Hide takes an item off the order screens and Daily Pars without deleting it (Show puts it back). Delete removes it from every screen but keeps it for past orders and reports; Deleted lists them with Restore.
- Changes sync to every device. Items changed or deleted here are no longer overwritten by built-in menu updates.

## New-Order Sound on the KMS
- The KMS plays a chime (two quick dings) and shows "New ticket on the KMS" when a ticket arrives, or more items are sent on an open ticket, with work for the station on screen. All Tickets and Expo chime for every ticket; Grill, Fry, Beverage, etc. only for tickets with items for that station.
- A ticket already up when the KMS opens (or when switching stations) doesn't chime.
- "Sound On / Sound Off" button at the top of the KMS, saved separately on each device, plus "Test Sound".
- Browsers only allow sound after the screen is tapped, so tap the KMS once after opening it ("Tap to Enable Sound" shows until then). Keep the iPad's volume up and the side switch off silent.

## Café Latte Hot or Iced
- The Café's Iced Latte is now "Latte" ($3) and asks Hot or Iced; Vanilla / Mocha / Caramel / Pumpkin flavor is optional. The Bistro's Iced Latte is unchanged.

## Culinary Offerings Board: Photos and Missing Café Items
- 19 more menu photos from the Guthrie Culinary Offerings board: Bistro burger, club, tomato basil soup, grilled cheese, Cobb salad, pommes frites, mac & cheese, broccolini and sprinkle sugar cookie; Café refreshers, hot honey wrap, quesadilla and street corn bowl.
- New Café items that were on the board but not in the app:
  - Cookie Butter Latte ($3) in Holiday Specials (Hot or Iced, whipped cream, drizzle, ice).
  - Cappuccino ($3, Beverage): optional Vanilla / Mocha / Caramel / Pumpkin, Hot or Iced required.
  - Double Chocolate Cookie and Sugar Cookie ($1 each, Dessert, Warm Cookie option).

## Pictures on Menu Buttons
- Every menu button on the order screen (Café, Bistro and Exemption Day) now has a picture above the name, and the add-item pop-up shows it next to the item name.
- Exemption Day items and the holiday lattes use photos from the Exemption Day menus (assets/menu). The same photos are used for matching café and Bistro items (lattes, hot coffee, peach tea, chocolate chip / chunk cookie, brownie).
- Other items show a food icon picked from the name (burger, sandwich, salad, soup, fries, cookie, drink...). Sold-out items show the picture greyed out.
- To give an item a real photo, add a .jpg to assets/menu and list the item's id in menuPhotoIds in app.js.

## Holiday Specials on the Café Menu; Iced Drinks
- The Café Menu tab has a Holiday Specials section at the top with the 8 holiday lattes ($3 each). Each asks Hot or Iced, then whipped cream, drizzle and ice. They are separate from the Exemption Day lattes, so each menu keeps its own daily pars.
- Horchata no longer asks Hot or Iced; like Peach Tea and Hibiscus Lime Agua Fresca it comes iced and can be added with no choices (ice and garnish options are still there).

## Checkout Redesign, Veteran Discount, Holiday Latte Buttons
- Tapping Checkout on an order now opens a payment screen for that order at the top of the page: the ticket on the left and Payment on the right (stacked on narrow screens), with a big Total Due and a "Mark Paid • $total" button. "All Orders" returns to the list and "Back to Order (Edit Items)" reopens the order to change it.
- Before, the payment panel sat beside (or below) the order list and Find an Order results, so with many orders it was pushed off screen. The order list is now compact tiles (name, total, item count, sent or not, how long it has been open) in a scrolling box, with a count on each tab (Tables / Counter / To-Go / Catering). Find an Order and refunds are below the list.
- Opening a screen or an order now always starts at the top of the page.
- Veteran Free Entrée shows on the checkout ticket as a discount: the entrée at full price, then "Discount: Veteran Free Entrée −$8.00", with Subtotal, Discounts and Total. The discount amount is saved with the payment.
- Each holiday latte has its own button on the Exemption Day tab (Peppermint Mocha, Winter Wonderland, Pumpkin Spice Latte, Chocolate Hazelnut Truffle, Caramel Pumpkin Cheesecake, Gingerbread Cookie Latte, S'mores Mocha, Brown Sugar Cinnamon Latte). The pop-up then asks Hot or Iced, plus whipped cream, drizzle and ice.

## Exemption Day Entrées: Black Beans and Simpler Options
- Black beans are a protein choice on the lunch entrées. Tacos and Nachos: Beef, Chicken, Black Beans Only, Beef + Black Beans or Chicken + Black Beans. Rice Bowls already include black beans, so they offer Beef, Chicken or Black Beans Only.
- Shorter option screen (about 20 buttons instead of 34) for students:
  - Leave Off: No Pico de Gallo / No Lettuce / No Cheese (plus No Chile con Queso on Nachos and No Rice / No Black Beans / No Roasted Corn on Rice Bowls).
  - Add Toppings: the 8 toppings plus Guacamole (+$1).
  - Other: Veteran Free Entrée and Allergy Alert.
  - The Light / Extra / On Side buttons were removed; type those in the custom note.

## KMS Recall, Clearing Inactive Tickets, and Back from Checkout
- Recently Completed on the KMS now lists every completed ticket, not just the last 5. It shows 10 to start, with Show 10 More and Show All. Each ticket has a checkbox, so several can be recalled at once with Recall Selected (Select All Shown / Clear Selection help).
- Expo and All Tickets show "Clear Inactive Tickets (1 hr+)" when any ticket has had no activity (sent, started, completed or recalled) for over an hour. Clearing takes them off the KMS and moves them to Recently Completed, where they can be recalled. Unpaid orders stay open for checkout.
- Checkout has a "Back to Order" button on the order being rung up. It opens the order screen (on the same menu tab, e.g. Exemption Day) to add, remove or change items; then tap Checkout again.

## Exemption Day Menu (Final, Wednesday Nov 11)
- The Exemption Day tab now matches the printed food and coffee menus, in menu order:
  - Breakfast Tacos (All Day) $2: Bacon, Pork Sausage or Turkey Sausage, on flour tortillas only. Salsa (red, green, on the side or none); No Eggs / No Potatoes / No Cheese / Extra Cheese.
  - Fresh Baked Cinnamon Rolls $3: Classic and Pumpkin (Fry station), with No / Extra / On Side icing and Warm.
  - Lunch Entrées (B, C & D Block) $8: Tacos, Nachos, Rice Bowl. Protein is required (Seasoned Shredded Beef / Shredded Chicken); Tacos also require Flour or Corn Tortilla.
    - Garnish: each standard topping (Pico de Gallo, Shredded Lettuce, Mexican Cheese Blend; plus Chile con Queso on Nachos and Seasoned Rice / Black Beans / Roasted Corn on Rice Bowls) can be No, Light, Extra or On Side.
    - Additional Toppings (any number): Corn Salsa, Diced Tomatoes, Diced Onions, Lime Wedges, Jalapeño Lime Crema, Chile con Queso, Red Salsa, Green Salsa, and Guacamole (+$1).
    - Veteran Free Entrée takes $8 off (guacamole is still charged).
  - Holiday Latte $3: choose 1 of 8 holiday flavors and Hot or Iced; whipped cream, drizzle and ice options.
  - Latte $3 (Vanilla / Caramel / Mocha / Hazelnut) and Cappuccino $3 (any of the 12 flavors or none), Hot or Iced.
  - Americano $2; any syrup flavor is +$1.
  - Horchata (Hot or Iced), Hibiscus Lime Agua Fresca and Peach Tea, $3, with ice and garnish options.
- Desserts are not being run, so none are on the tab. The Guthrie Bistro Burger is no longer on the Exemption Day tab (old orders still show it).
- The add-item pop-up shows options in labeled groups. "Choose 1" groups switch when another option is tapped, and the item can't be added until required groups (taco tortilla, protein, flavor, hot/iced) have a choice; the missing group is highlighted.
- Chosen options print on the ticket and KMS and count in reports like any other modifier.

## Find an Order
- New "Find an Order" search on Checkout and Counter + To-Go. Searches customer/table name, order number, items, modifiers and notes, and payment type (e.g. "maria", "green salsa", "card", "table 4"). Several words narrow it down.
- Filters: All / Open / Paid, and Today / All Dates. Shows the newest 50 matches.
- Each result shows the order number, start time, type, name, items, total and status. Details shows every line with seat, options, payment and refunds. Open orders have Edit and Checkout; paid orders have Refund (managers and cashiers).

## "Order Not Found" While Taking an Order
- Cause 1 (fixed in the many-devices sync fix): a device that hadn't received a new order yet could send a copy without it, and the other devices dropped it, including the register taking that order.
- Cause 2: Checkout's "Clear Empty/Stuck Orders" deleted every order with no items yet, on every device, including one a register had just opened. It now only clears empty orders older than 15 minutes.
- If an order is closed on another device, the order screen says so and offers Counter + To-Go / Dining Room buttons.

## Sync Fix for Many Devices
- Each device now saves with a transaction: it reads the latest shared copy, merges its changes in, and writes only if no other device wrote in between (otherwise it retries). Before, a device sent its whole copy, which could overwrite what other devices had just saved.
- An order missing from another device's copy is no longer treated as deleted. Deleted orders are recorded (kept 7 days) so a deletion still reaches every device. With many devices this used to drop new orders (lost sales).
- Tested with up to 10 simulated devices (manager, registers and KMS screens) saving at once: every order, sale count, par and setting matched on all devices.

## Daily Pars Sync Fix
- Pars saved on one device were being wiped out when another device (a register or KMS) saved at about the same time; the update from the other device replaced everything except orders. Settings, menu, inventory and pars now merge between devices like orders do: each change is time-stamped and the newer one wins.
- Sold / Remaining counts are now worked out from the order lines rung up today instead of a stored number, so two registers selling the same item at once both count. Removing a line puts it back automatically. "Refill All to Par" starts the count over from that moment.
- The Daily Pars screen no longer redraws (and loses typed numbers) while pars are typed but not yet saved.

## Item Popup No Longer Closes While Ordering
- Updates arriving from other devices used to redraw the screen immediately, closing the item popup a student had open (and wiping anything being typed). The screen now waits to redraw until the popup is closed and no box is being typed in.

## Orders No Longer Lost Between Devices
- Fixed orders sent to the KMS disappearing and tickets Expo completed coming back. Devices used to overwrite the whole shared data with their own copy, so a device saving a slightly older copy wiped out other devices' new orders and KMS progress.
- Orders are now merged by order: each order records when it was last changed and the newer copy wins; orders a device just entered are kept and re-sent.

## Cinnamon Rolls to Fry
- Exemption Day Cinnamon Rolls now route to the Fry station on the KMS for prep (were Dessert). Devices that already loaded the menu are updated.

## Quantity and Remove While Ringing Up
- The add-item pop-up has a Quantity picker (− / + or type a number). Adding 3 puts 3 lines on the ticket with the same options, so the KMS, Daily Pars and reports count each one. If a par doesn't have enough left, it says how many remain.
- The ticket on the order screen (Counter + To-Go, Dining Room and Catering) now has a Remove button on each line, so mistakes can be fixed before checkout. Removed items go back to the daily par; removing an item already sent to the KMS warns first and takes it off the kitchen screens. An order emptied this way stays open for more items.

## Exemption Day Menu
- Added an **Exemption Day** tab to Counter + To-Go order entry (next to Café Menu and Bistro Menu), and an Exemption Day filter on Daily Pars.
- Breakfast Tacos ($2): Bacon, Sausage or Turkey Sausage, each with Red Salsa or Green Salsa.
- Cinnamon Roll ($3).
- Hot Coffee ($2): Vanilla / Mocha / Caramel / Pumpkin syrup is +$1.
- Iced Latte ($3) with Vanilla / Mocha / Caramel / Pumpkin.
- Peach Tea and Hibiscus Lime Agua Fresca ($3).
- Entrée: Guthrie Bistro Burger at its Bistro price ($12), with the same options and pommes frites to the Fry station.

## Sync Loop Fix (orders flickering at checkout)
- Fixed a loop where a device running an older cached copy of the app and an updated device kept undoing each other's menu changes and re-sending the whole shared data, which made open orders (e.g. a grilled cheese at checkout) appear and disappear.
- Menu fixes applied to incoming cloud data no longer trigger a push on their own; the migrated result is sent once, when the device connects.
- The app now stamps its version on the shared data; a device that sees a newer version reloads itself (at most once every 5 minutes). Bump `GUTHRIE_RMS_VERSION` in app.js and the `?v=` tag in index.html with each release.

## Fry Station and Item Components on the KMS
- Added a Fry station to the KMS. Oven-Baked Pommes Frites now route to Fry.
- Items with parts made at another station show that part on that station's screen. The burger, turkey club and buttermilk chicken send their pommes frites to Fry; a side swap sends the broccolini or mac & cheese to the Grill instead.
- Each part has its own Start / Complete. Expo shows each item with its parts underneath, an item counts as done only when all its parts are done, and the station Done counts and Complete All buttons cover parts too.

## Coffees on the Bistro Menu
- Added Iced Latte and Hot Coffee with Syrup ($3 each, Vanilla / Mocha / Caramel / Pumpkin) to the Bistro menu under Beverages, matching the Café versions. Both route to the Beverage station.

## Condiment Wording
- Condiment options now read "Add Side of Ketchup / Mustard / Mayo / Pickles / Aioli" instead of "… on Side". Saved menus on existing devices are renamed in place.
- "Aioli on Side" stays on the Buttermilk-Brined Chicken and Pommes Frites, where it means moving the aioli the dish comes with to the side.

## Condiments on the Side
- All sandwiches (Guthrie Bistro Burger, Smoked Turkey Club, Buttermilk-Brined Chicken, Golden Melt Grilled Cheese): Ketchup, Mustard, Mayo, Pickles and Aioli on Side.
- Oven-Baked Pommes Frites: Ketchup, Mustard and Mayo on Side, alongside Aioli on Side.

## Bistro Team Assignments
- Set 22 C-Block Bistro Team students to their chart positions (matched by student ID), applied once so later changes in Settings stick. Jason is not on the roster yet and was skipped.

## Bistro Team Positions
- Added the C-Block Bistro Team positions: Executive Chef, Sous Chef, Kitchen Shift Manager, Kitchen Department Lead, Hot Station Lead/Team, Fry Station Lead/Team, Cold/Garde Manger Lead/Team, Prep Lead/Team, Pastry Lead/Team, Beverage Station Lead, Expo / Assembly, Floater (Cashier already existed).
- Added once to existing position lists, so removing one in Settings > Positions sticks.

## Menu Update Sync Fix
- After connecting, a device now sends its menu updates (new items, modifiers, prices) back to the shared cloud data, so every device gets them — including ones still running an older cached copy of the app.
- index.html loads app.js, firebase-sync.js and styles.css with a version tag so browsers fetch the new files after an update instead of a cached copy. Bump the `?v=` value in index.html with each release.

## Italian Cream Soda Flavors
- Added flavor choices to Italian Cream Soda: Blue Raspberry, Peach, Mango, Strawberry, Raspberry, Vanilla, Blueberry.
- Devices that already have the Bistro menu pick up new menu modifiers automatically.

## Golden Melt Grilled Cheese
- Added Golden Melt Grilled Cheese ($3) to the Bistro menu under Handhelds (Grill station).

## Separate Café and Bistro Menus
- Added the Bistro dining menu from the Guthrie Bistro Menu insert (Handhelds, Greens & Bowls, Weekly Chef Special, Sides, Beverages, Bake Shop) with its prices and modifiers.
- Dining Room tables show only the Bistro menu; Counter + To-Go orders have Café Menu / Bistro Menu tabs (Café by default). Menu buttons are grouped by category.
- Retired the starter demo items (Bistro Burger, Southern Cobb Salad, Peach Tea, Cookie); they stay saved so old orders and reports read correctly.
- Menu items carry their KMS station; Daily Pars filters by Café / Bistro menu.
- Modifiers can carry a price: swapping the included pommes frites for Charred Broccolini or Gruyère Mac & Cheese adds $1.00 to the sandwich.

## Two-Step KMS
- Replaced Start Prep → Plating → Ready → Complete with two steps: Start, then Complete.
- Each item has a Start button that turns into Complete; finished items show ✓ Done (tap to undo). Stations get Start All / Complete All.
- Starting any item starts the ticket automatically; Expo has Start Ticket / Complete Ticket. Tickets saved in the old Prep / Plating / Ready stages show as Started.

## Cash Change Calculator
- Cash checkout shows the amount due, an "Amount Given by Guest" box, and quick buttons (Exact, next dollar, $5/$10/$20/$50/$100).
- Shows the change to give back live, or how much the guest is short.
- Mark Paid requires the amount given and blocks short payments; after paying, a pop-up reminds the student how much change to give.

## KMS Ticket Fixes
- Paying a check no longer clears its KMS ticket (including Dining Room tables); tickets stay until Expo completes them.
- Station screens (Grill, Beverage, etc.) only mark their own items done; Start Prep / Plating / Ready / Complete are on Expo and All Tickets only, so a station can't close the ticket for the kitchen.
- Expo is asked to confirm before marking a ticket Ready or Complete while station items are still open.

## Café Services Scheduling
- Added Café Services as a scheduling Operation option, listed after Counter + To-Go (added once to existing installs; can still be removed in Settings).

## KMS Build-Out
- Expo now sees every line on every ticket, with its station, seat, each modifier as its own tag (allergy alerts in red), and custom notes.
- Stations mark their own items done (per item or with a station Done button); Expo sees a check mark on finished lines and an items-done count.
- Items added after a ticket was sent show a NEW tag; the log records "Added Items Sent".
- Counter and to-go tickets paid before they are made stay on the KMS (marked PAID) until completed.
- Added a Recently Completed list with Recall, oldest-first ticket order, and timers that tick without redrawing the screen (the action log stays open).

## Sales by Item Report
- Added a Sales by Item table to Reports: quantity sold, sales, % of sales, category, and a count of each modifier (e.g. Iced Latte flavors).
- Added Today / Last 7 Days / This Month / All Time / Custom date ranges to the sales figures, sales by order type, and CSV exports.
- Added an Export Item Sales CSV button.

## Daily Pars
- Added a Daily Pars screen (managers and teachers) to set how many of each menu item are available for the day, grouped by category with All / Counter + To-Go / Dining Room filters.
- Shows sold and remaining counts, marks items Sold Out at 0, and adds 86 / Un-86 buttons plus Refill All to Par and Clear All Pars.
- Pars carry over day to day; counts refill and manual 86s clear automatically on the first use each morning (local date), with the previous day logged to production history.

## Common Grounds Café Menu
- Added 14 Common Grounds café items (cookies, protein muffins, wraps/quesadilla/bowl, refreshers, Iced Latte, Hot Coffee with Syrup) to Counter + To-Go ordering, priced at cookies $1, muffins $2, refreshers $3, Iced Latte / Hot Coffee with Syrup $3, and entrées $4.
- Added modifiers for each café item, including Vanilla / Mocha / Caramel / Pumpkin flavor choices for Iced Latte and Hot Coffee with Syrup.
- Café items are hidden from Dining Room table orders and route to the Beverage, Dessert, and Grill KMS stations.

## Phase 8C
- Restored Recipes / Labs tools.
- Added recipe ingredient lines tied to Culinary Inventory.
- Added culinary lab inventory deduction and usage logging.
- Added teacher student tracking support.
- Preserved Phase 8B demo mode, Bistro menu growth, production pars, running counts, 86 controls, and report exports.

## Phase 8B
- Added manager Demo Mode toggle.
- Added Bistro menu item management by category.
- Added daily production pars, running item counts, and 86 controls.
- Updated report export tools.


### Theme & Appearance
- Added manager-controlled color customization
- Added font selector
- Added page background styles
- Added card/button shape controls
- Added live theme preview and reset action

## 2026-08-18 - Inventory, Catering, and Student Position Update
- Added explicit Add/Edit/Delete inventory item workflows.
- Added direct quantity and storage-location editing in inventory tables.
- Added Walk-In Fridge and Walk-In Freezer to storage locations.
- Reworked Catering Guest Count into its own form block below Event Date.
- Added enterprise student leadership and shift positions from the Operations Manual.
- Student positions continue to feed shift scheduling and position-history tracking.
