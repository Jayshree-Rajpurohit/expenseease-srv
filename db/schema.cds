namespace com.expenseease;

using { cuid, managed } from '@sap/cds/common';

entity Expenses : cuid, managed {
    title       : String(200) not null;
    category    : String(50) not null;
    amount      : Decimal(10, 2) not null;
    currency    : String(3) default 'EUR';
    date        : Date not null;
    status      : String(20) default 'Draft';
    notes       : String(1000);
}