# Title: Societas Management System (SMS)

Website: sms.societasmusic.com

Authors: Aiden O'Neal

Copyright (C) 2023-2024 Societas Music Group Corporation. All Rights Reserved.

## Page Structure

- Upper Header - Main Navigation
- Middle Header - Searchbar
- Lower Header - Page Title
- Main Content
- Footer - Misc Naviation / App Info

## User Permission Levels

- Action-Based
  - Viewer
    - Read only
  - Editor
    - Read/write
- Module-Based
  - Configuration
    - Users
  - Accounting
    - Configuration
    - Analytics
    - Import Wizard
    - Chart of Accounts
    - General Ledger
    - Sales
    - Purchases

## DB Collections

- Accounts
  - accountId
  - name
  - accountType
  - parentAccount
  - isGroup
- Entries
  - entryId
  - entryType
  - date
  - remark
  - rows
    - accountId
    - debit
    - credit
- Parties
  - partyId
  - name
  - partyType (i.e., Vendor, Customer, Both)
  - businessCategory
  - taxTerritory
  - businessType
  - taxId
  - address
    - line1
    - line2
    - city
    - state
    - zip
    - country
  - email
  - phone
  - altPhone
  - currency
  - billingAccount (AR or AP)
- Items
  - itemId
  - name
  - image
  - itemType (i.e., Sales, Purchases, Both)
  - itemSubType (i.e., Service, Product)
  - rate
  - unit (i.e., hr, day, g, m, Kg, ea)
- Users
  - userId
  - fName
  - lName
  - email
  - access

## Modules

- Accounting
  - Configuration
    - Locale / Country
    - Currency
    - Fiscal Year
    - Write-Off Account
    - Round-Off Account
    - Tax Templates
    - Numbering Series
    - Measurement Units
    - Form Customization
  - Chart of Accounts
    - (1) Assets
    - (2) Liabilities
    - (3) Equity
    - (4) Revenue
    - (5/6/7) Expenses
  - General Ledger
    - Entries
    - Invoices
    - Parties
    - Items
  - Sales
    - Entries
    - Invoices
    - Sales Payments
    - Customers
    - Sales Items
  - Purchases
    - Entires
    - Invoices
    - Purchase Payments
    - Vendors
    - Purchase Items
  - Analytics
    - General Ledger
    - Profit Loss
    - Balance Sheet
    - Trial Balance
  - Import Wizard
    - Templates
    - Column Editor

## Sales Process

1. Customer sends request for quote (RFQ)
2. Business sends quotes
3. Customer sends purchase order
4. Business sends sales order
5. Business fullfils order
6. Business sends invoice - Debit AR & Credit Sales
7. Customer remits payment - Debit Cash & Credit AR
8. Customer sends receipt
