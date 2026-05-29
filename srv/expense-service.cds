using { com.expenseease as db } from '../db/schema';

service ExpenseService @(path: '/expense') {
    entity Expenses as projection on db.Expenses;
}