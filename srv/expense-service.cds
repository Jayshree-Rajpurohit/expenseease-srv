using { com.expenseease as db } from '../db/schema';

service ExpenseService @(path: '/odata/v4/expense') {
    entity Expenses as projection on db.Expenses;
}